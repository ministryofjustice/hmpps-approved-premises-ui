import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import { addDays } from 'date-fns'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesFactory,
  placementRequestDetailFactory,
} from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'
import { occupancySummary } from '../../../utils/match'
import matchPaths from '../../../paths/match'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import * as validationUtils from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
  dayAvailabilitySummaryListItems,
} from '../../../utils/match/occupancy'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'
  const flashSpy = jest.fn()

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})

  let occupancyViewController: OccupancyViewController
  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = placementRequestDetailFactory.build({ duration: 84 })
  const premiseCapacity = cas1PremiseCapacityFactory.build()
  let request: Readonly<DeepMocked<Request>>

  const apType = 'esap'
  const placeholderDetailsUrl = matchPaths.v2Match.placementRequests.search.dayOccupancy({
    id: placementRequestDetail.id,
    premisesId: premises.id,
    date: ':date',
  })

  beforeEach(() => {
    jest.clearAllMocks()

    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)
    request = createMock<Request>({
      user: { token },
      query: {},
      flash: flashSpy,
      headers: {
        referer: '/referrerPath',
      },
    })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(premiseCapacity)

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue({
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
        apType,
      }

      const params = { id: placementRequestDetail.id, premisesId: premises.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(
        token,
        premises.id,
        expectedStartDate,
        DateFormats.dateObjToIsoDate(addDays(expectedStartDate, expectedDuration)),
      )

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest: placementRequestDetail,
        premises,
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
        criteria: undefined,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequestDetail, { showActions: false }),
        summary: occupancySummary(premiseCapacity.capacity),
        calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl),
        errors: {},
        errorSummary: [],
      })
    })

    it('should render the occupancy view template with booking errors', async () => {
      const query = {
        apType,
      }

      const params = { id: placementRequestDetail.id, premisesId: premises.id }

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

      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue({
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
          calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl),
          summary: occupancySummary(premiseCapacity.capacity),
        }),
      )
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should render the occupancy view template with filtered start date, duration and criteria', async () => {
      const query = {
        apType,
        'startDate-day': '30',
        'startDate-month': '04',
        'startDate-year': '2025',
        durationDays: '100',
        criteria: ['isSingle', 'isWheelchairDesignated'],
      }

      const params = { id: placementRequestDetail.id, premisesId: premises.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, '2025-04-30', '2025-08-08')
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
          criteria: ['isSingle', 'isWheelchairDesignated'],
          durationDays: 100,
          startDate: '2025-04-30',
          'startDate-day': '30',
          'startDate-month': '4',
          'startDate-year': '2025',
          summary: occupancySummary(premiseCapacity.capacity, ['isSingle', 'isWheelchairDesignated']),
          calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl, [
            'isSingle',
            'isWheelchairDesignated',
          ]),
        }),
      )
    })

    it('should show an error if the filter date is invalid', async () => {
      const query = {
        apType,
        'startDate-day': '32',
        'startDate-month': '2',
        'startDate-year': '2025',
        durationDays: '84',
      }

      const params = { id: placementRequestDetail.id, premisesId: premises.id }

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/placementRequests/occupancyView/view',
        expect.objectContaining({
          errors: { startDate: { attributes: { 'data-cy-error-startDate': true }, text: 'Enter a valid date' } },
          errorSummary: [{ text: 'Enter a valid date', href: '#startDate' }],
          'startDate-day': '32',
          'startDate-month': '2',
          'startDate-year': '2025',
          summary: undefined,
          calendar: undefined,
        }),
      )
      expect(premisesService.getCapacity).not.toHaveBeenCalled()
    })
  })

  describe('bookSpace', () => {
    const params = { id: placementRequestDetail.id, premisesId: premises.id }

    const startDate = '2025-08-15'
    const durationDays = '22'

    const validBookingBody = {
      criteria: 'hasEnSuite,isStepFreeDesignated',
      'arrivalDate-day': '11',
      'arrivalDate-month': '2',
      'arrivalDate-year': '2026',
      'departureDate-day': '21',
      'departureDate-month': '2',
      'departureDate-year': '2026',
    }

    it(`should redirect to space-booking confirmation page when date validation succeeds`, async () => {
      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, params, body: validBookingBody }, response, next)

      const expectedQueryString =
        'arrivalDate=2026-02-11&departureDate=2026-02-21&criteria=hasEnSuite&criteria=isStepFreeDesignated'

      expect(response.redirect).toHaveBeenCalledWith(
        `${matchPaths.v2Match.placementRequests.spaceBookings.new(params)}?${expectedQueryString}`,
      )
    })

    describe('when there are errors', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
      })

      it(`should redirect to occupancy view when dates are empty`, async () => {
        const body = {}

        const requestHandler = occupancyViewController.bookSpace()
        await requestHandler({ ...request, params, body }, response, next)

        const expectedErrorData = {
          arrivalDate: 'You must enter an arrival date',
          departureDate: 'You must enter a departure date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          matchPaths.v2Match.placementRequests.search.occupancy({
            id: placementRequestDetail.id,
            premisesId: premises.id,
          }),
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to occupancy view when dates are invalid`, async () => {
        const body = {
          'arrivalDate-day': '31',
          'arrivalDate-month': '02',
          'arrivalDate-year': '2025',
          'departureDate-day': '34',
          'departureDate-month': '05',
          'departureDate-year': '19999',
        }

        const requestHandler = occupancyViewController.bookSpace()
        await requestHandler({ ...request, params, body }, response, next)

        const expectedErrorData = {
          arrivalDate: 'The arrival date is an invalid date',
          departureDate: 'The departure date is an invalid date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          matchPaths.v2Match.placementRequests.search.occupancy({
            id: placementRequestDetail.id,
            premisesId: premises.id,
          }),
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to occupancy view when the departure date is before the arrival date`, async () => {
        const body = {
          'arrivalDate-day': '28',
          'arrivalDate-month': '01',
          'arrivalDate-year': '2025',
          'departureDate-day': '27',
          'departureDate-month': '01',
          'departureDate-year': '2025',
        }

        const requestHandler = occupancyViewController.bookSpace()
        await requestHandler({ ...request, params, body }, response, next)

        const expectedErrorData = {
          departureDate: 'The departure date must be after the arrival date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          matchPaths.v2Match.placementRequests.search.occupancy({
            id: placementRequestDetail.id,
            premisesId: premises.id,
          }),
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to occupancy view with the existing query string`, async () => {
        const body = {}
        const query = {
          startDate,
          durationDays,
          criteria: ['isWheelchairDesignated', 'isSuitedForSexOffenders'],
        }

        const requestHandler = occupancyViewController.bookSpace()
        await requestHandler({ ...request, params, query, body }, response, next)

        const expectedQueryString = `startDate=${startDate}&durationDays=${durationDays}&criteria=isWheelchairDesignated&criteria=isSuitedForSexOffenders`

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          `${matchPaths.v2Match.placementRequests.search.occupancy({
            id: placementRequestDetail.id,
            premisesId: premises.id,
          })}?${expectedQueryString}`,
        )
      })
    })
  })

  describe('viewDay', () => {
    it('should render the day occupancy view template with given approved premises, date and criteria', async () => {
      const date = '2025-03-23'
      const criteria: Array<Cas1SpaceBookingCharacteristic> = ['isWheelchairDesignated', 'isArsonSuitable']

      const dayCapacity = cas1PremiseCapacityForDayFactory.build({})
      const premisesCapacityForDay = cas1PremiseCapacityFactory.build({
        premise: premises,
        startDate: date,
        endDate: date,
        capacity: [dayCapacity],
      })
      when(premisesService.getCapacity)
        .calledWith(request.user.token, premises.id, date)
        .mockResolvedValue(premisesCapacityForDay)

      const query = {
        criteria,
      }
      const params = { id: placementRequestDetail.id, premisesId: premises.id, date }

      const requestHandler = occupancyViewController.viewDay()

      await requestHandler({ ...request, params, query }, response, next)

      const expectedStatus = dayAvailabilityStatus(dayCapacity, criteria)

      expect(premisesService.getCapacity).toHaveBeenCalledWith('SOME_TOKEN', premises.id, date)
      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/viewDay', {
        backlink: '/referrerPath',
        pageHeading: dayAvailabilityStatusMap[expectedStatus],
        placementRequest: placementRequestDetail,
        premises,
        date,
        status: expectedStatus,
        availabilitySummaryListItems: dayAvailabilitySummaryListItems(dayCapacity, criteria),
      })
    })
  })
})
