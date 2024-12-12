import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { Cas1PremiseCapacity, PlacementRequestDetail } from '@approved-premises/api'
import { when } from 'jest-when'
import { addDays } from 'date-fns'
import { PlacementRequestService, PremisesService } from '../../../services'
import { cas1PremiseCapacityFactory, placementRequestDetailFactory } from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'
import {
  filterOutAPTypes,
  occupancySummary,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
} from '../../../utils/match'
import matchPaths from '../../../paths/match'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'

jest.mock('../../../utils/validation')

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})

  let occupancyViewController: OccupancyViewController
  let placementRequestDetail: PlacementRequestDetail
  let premiseCapacity: Cas1PremiseCapacity
  let request: Readonly<DeepMocked<Request>>

  const premisesName = 'Hope House'
  const premisesId = 'abc123'
  const apType = 'esap'

  beforeEach(() => {
    jest.resetAllMocks()
    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)
    request = createMock<Request>({
      user: { token },
      flash: flashSpy,
    })
    placementRequestDetail = placementRequestDetailFactory.build({ duration: 84 })
    premiseCapacity = cas1PremiseCapacityFactory.build()
    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.getCapacity.mockResolvedValue(premiseCapacity)

    when(fetchErrorsAndUserInput as jest.Mock)
      .calledWith(request)
      .mockReturnValue({
        errors: {},
        errorSummary: [],
        userInput: {},
      })
  })

  describe('view', () => {
    it('should render the occupancy view template with placement start date and duration', async () => {
      const expectedStartDate = placementRequestDetail.expectedArrival
      const expectedDuration = placementRequestDetail.duration

      const query = {
        premisesName,
        premisesId,
        apType,
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(
        token,
        premisesId,
        placementRequestDetail.expectedArrival,
        DateFormats.dateObjToIsoDate(addDays(placementRequestDetail.expectedArrival, placementRequestDetail.duration)),
      )

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest: placementRequestDetail,
        premisesName,
        premisesId,
        apType,
        startDate: expectedStartDate,
        ...DateFormats.isoDateToDateInputs(expectedStartDate, 'startDate'),
        durationDays: expectedDuration,
        durationOptions: [
          { text: 'Up to 1 week', value: '7' },
          { text: 'Up to 6 weeks', value: '42' },
          { text: 'Up to 12 weeks', value: '84', selected: true },
          { text: 'Up to 26 weeks', value: '182' },
          { text: 'Up to 52 weeks', value: '364' },
        ],
        criteriaOptions: [
          { value: 'isWheelchairDesignated', text: 'Wheelchair accessible', checked: false },
          { value: 'isSingle', text: 'Single room', checked: false },
          { value: 'isStepFreeDesignated', text: 'Step-free', checked: false },
          { value: 'hasEnSuite', text: 'En-suite', checked: false },
          { value: 'isSuitedForSexOffenders', text: 'Suitable for sex offenders', checked: false },
          { value: 'isArsonSuitable', text: 'Designated arson room', checked: false },
        ],
        matchingDetailsSummaryList: occupancyViewSummaryListForMatchingDetails(
          premiseCapacity.premise.bedCount,
          placementRequestDetail,
        ),
        summary: occupancySummary(premiseCapacity.capacity),
        calendar: occupancyCalendar(premiseCapacity.capacity),
        errors: {},
        errorSummary: [],
      })
    })

    it('should render the occupancy view template with errors', async () => {
      const query = {
        premisesName,
        premisesId,
        apType,
      }

      const params = { id: placementRequestDetail.id }

      const expectedErrors = {
        arrivalDate: {
          text: 'You must enter an arrival date',
          attributes: {
            'data-cy-error-arrivalDate': true,
          },
        },
      }
      const expectedErrorSummary = [
        {
          text: 'You must enter an arrival date',
          href: '#arrivalDate',
        },
      ]
      const expectedUserInput = {
        'arrivalDate-day': '',
        'arrivalDate-month': '',
        'arrivalDate-year': '',
        'departureDate-day': '1',
        'departureDate-month': '5',
        'departureDate-year': '2026',
      }

      when(fetchErrorsAndUserInput as jest.Mock)
        .calledWith(request)
        .mockReturnValue({
          errors: expectedErrors,
          errorSummary: expectedErrorSummary,
          userInput: expectedUserInput,
        })

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/placementRequests/occupancyView/view',
        expect.objectContaining({
          errors: expectedErrors,
          errorSummary: expectedErrorSummary,
          'arrivalDate-day': '',
          'arrivalDate-month': '',
          'arrivalDate-year': '',
          'departureDate-day': '1',
          'departureDate-month': '5',
          'departureDate-year': '2026',
        }),
      )
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should render the occupancy view template with filtered start date, duration and criteria', async () => {
      const query = {
        premisesName,
        premisesId,
        apType,
        'startDate-day': '30',
        'startDate-month': '04',
        'startDate-year': '2025',
        durationDays: '100',
        criteria: ['isSingle', 'isWheelchairDesignated'],
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premisesId, '2025-04-30', '2025-08-08')
      expect(response.render).toHaveBeenCalledWith(
        'match/placementRequests/occupancyView/view',
        expect.objectContaining({
          durationOptions: [
            { text: 'Up to 1 week', value: '7' },
            { text: 'Up to 6 weeks', value: '42' },
            { text: 'Up to 12 weeks', value: '84' },
            { text: 'Up to 26 weeks', value: '182', selected: true },
            { text: 'Up to 52 weeks', value: '364' },
          ],
          criteriaOptions: [
            { value: 'isWheelchairDesignated', text: 'Wheelchair accessible', checked: true },
            { value: 'isSingle', text: 'Single room', checked: true },
            { value: 'isStepFreeDesignated', text: 'Step-free', checked: false },
            { value: 'hasEnSuite', text: 'En-suite', checked: false },
            { value: 'isSuitedForSexOffenders', text: 'Suitable for sex offenders', checked: false },
            { value: 'isArsonSuitable', text: 'Designated arson room', checked: false },
          ],
          durationDays: 100,
          startDate: '2025-04-30',
          summary: occupancySummary(premiseCapacity.capacity, ['isSingle', 'isWheelchairDesignated']),
          calendar: occupancyCalendar(premiseCapacity.capacity, ['isSingle', 'isWheelchairDesignated']),
        }),
      )
    })
  })

  describe('bookSpace', () => {
    const startDate = '2025-08-15'
    const durationDays = '22'
    const arrivalDay = '11'
    const arrivalMonth = '2'
    const arrivalYear = '2026'

    const validBookingBody = {
      premisesId,
      premisesName,
      apType,
      startDate,
      durationDays,
      'arrivalDate-day': arrivalDay,
      'arrivalDate-month': arrivalMonth,
      'arrivalDate-year': arrivalYear,
      'departureDate-day': '21',
      'departureDate-month': '2',
      'departureDate-year': '2026',
    }

    it(`should redirect to space-booking confirmation page when date validation succeeds`, async () => {
      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, params, body: validBookingBody }, response, next)

      const expectedPremisesName = encodeURIComponent(premisesName)
      const expectedDurationDays = 10
      const expectedStartDate = `${arrivalYear}-0${arrivalMonth}-${arrivalDay}`
      const expectedParams = `premisesName=${expectedPremisesName}&premisesId=${premisesId}&apType=${apType}&startDate=${expectedStartDate}&durationDays=${expectedDurationDays}`
      expect(response.redirect).toHaveBeenCalledWith(
        `${matchPaths.v2Match.placementRequests.spaceBookings.new({ id: placementRequestDetail.id })}?${expectedParams}`,
      )
    })

    it(`should redirect to occupancy view and add errors messages when date validation fails`, async () => {
      const emptyDay = ''
      const body = {
        ...validBookingBody,
        'arrivalDate-day': emptyDay,
      }
      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, params, body }, response, next)

      expect(addErrorMessageToFlash).toHaveBeenCalledWith(request, 'You must enter an arrival date', 'arrivalDate')

      const expectedPremisesName = encodeURIComponent(premisesName)
      const expectedParams = `premisesName=${expectedPremisesName}&premisesId=${premisesId}&apType=${apType}&startDate=${startDate}&durationDays=${durationDays}`
      expect(response.redirect).toHaveBeenCalledWith(
        `${matchPaths.v2Match.placementRequests.spaceBookings.viewSpaces({ id: placementRequestDetail.id })}?${expectedParams}`,
      )
    })
  })
})
