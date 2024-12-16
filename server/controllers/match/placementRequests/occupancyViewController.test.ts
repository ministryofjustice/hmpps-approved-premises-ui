import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { type Cas1PremiseCapacity, PlacementRequestDetail } from '@approved-premises/api'
import { when } from 'jest-when'
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

  beforeEach(() => {
    jest.resetAllMocks()
    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)
    request = createMock<Request>({
      user: { token },
      flash: flashSpy,
    })
    placementRequestDetail = placementRequestDetailFactory.build()
    premiseCapacity = cas1PremiseCapacityFactory.build()
    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.getCapacity.mockResolvedValue(premiseCapacity)
  })

  describe('view', () => {
    it('should render the occupancy view template', async () => {
      const startDate = '2024-07-26'
      const durationDays = '40'
      const premisesName = 'Hope House'
      const premisesId = 'abc123'
      const apType = 'esap'

      const query = {
        startDate,
        durationDays,
        premisesName,
        premisesId,
        apType,
      }

      const params = { id: placementRequestDetail.id }

      when(fetchErrorsAndUserInput as jest.Mock)
        .calledWith(request)
        .mockReturnValue({
          errors: {},
          errorSummary: [],
          userInput: {},
        })

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest: placementRequestDetail,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
        matchingDetailsSummaryList: occupancyViewSummaryListForMatchingDetails(
          premiseCapacity.premise.bedCount,
          placementDates(startDate, durationDays),
          placementRequestDetail,
          filterOutAPTypes(placementRequestDetail.essentialCriteria),
        ),
        occupancySummaryHtml: occupancySummary(premiseCapacity),
        calendar: occupancyCalendar(premiseCapacity),
        errors: {},
        errorSummary: [],
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should render the occupancy view template with errors', async () => {
      const startDate = '2024-07-26'
      const durationDays = '40'
      const premisesName = 'Hope House'
      const premisesId = 'abc123'
      const apType = 'esap'

      const query = {
        startDate,
        durationDays,
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

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premisesName}`,
        placementRequest: placementRequestDetail,
        premisesName,
        premisesId,
        apType,
        startDate,
        durationDays,
        matchingDetailsSummaryList: occupancyViewSummaryListForMatchingDetails(
          premiseCapacity.premise.bedCount,
          placementDates(startDate, durationDays),
          placementRequestDetail,
          filterOutAPTypes(placementRequestDetail.essentialCriteria),
        ),
        occupancySummaryHtml: occupancySummary(premiseCapacity),
        calendar: occupancyCalendar(premiseCapacity),
        errors: expectedErrors,
        errorSummary: expectedErrorSummary,
        'arrivalDate-day': '',
        'arrivalDate-month': '',
        'arrivalDate-year': '',
        'departureDate-day': '1',
        'departureDate-month': '5',
        'departureDate-year': '2026',
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })

  describe('bookSpace', () => {
    const premisesId = '08f1af53-8c0d-4ad5-abe1-724f4b639538'
    const premisesName = 'Hope House'
    const apType = 'normal'
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
