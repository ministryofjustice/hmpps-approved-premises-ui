import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { type Cas1PremiseCapacity, PlacementRequestDetail } from '@approved-premises/api'
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

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})

  let occupancyViewController: OccupancyViewController
  let placementRequestDetail: PlacementRequestDetail
  let premiseCapacity: Cas1PremiseCapacity

  beforeEach(() => {
    jest.resetAllMocks()
    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService)

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

      const requestHandler = occupancyViewController.view()

      await requestHandler({ ...request, params, query }, response, next)

      const expectedEmptyErrors = {}
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
        errors: expectedEmptyErrors,
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
    const departureDay = '21'
    const departureMonth = '2'
    const departureYear = '2026'

    it(`should redirect to space-booking confirmation page when date validation succeeds`, async () => {
      const body = {
        premisesId,
        premisesName,
        apType,
        startDate,
        durationDays,
        'arrivalDate-day': arrivalDay,
        'arrivalDate-month': arrivalMonth,
        'arrivalDate-year': arrivalYear,
        'departureDate-day': departureDay,
        'departureDate-month': departureMonth,
        'departureDate-year': departureYear,
      }
      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, params, body }, response, next)

      const expectedPremisesName = encodeURIComponent(premisesName)
      const expectedDurationDays = 10
      const expectedStartDate = `${arrivalYear}-0${arrivalMonth}-${arrivalDay}`
      const expectedParams = `premisesName=${expectedPremisesName}&premisesId=${premisesId}&apType=${apType}&startDate=${expectedStartDate}&durationDays=${expectedDurationDays}`
      expect(response.redirect).toHaveBeenCalledWith(
        `${matchPaths.v2Match.placementRequests.spaceBookings.new({ id: placementRequestDetail.id })}?${expectedParams}`,
      )
    })

    it(`should render the occupancy view template with errors when date validation fails`, async () => {
      const emptyDay = ''
      const body = {
        premisesId,
        premisesName,
        apType,
        startDate,
        durationDays,
        'arrivalDate-day': emptyDay,
        'arrivalDate-month': arrivalMonth,
        'arrivalDate-year': arrivalYear,
        'departureDate-day': departureDay,
        'departureDate-month': departureMonth,
        'departureDate-year': departureYear,
      }
      const params = { id: placementRequestDetail.id }

      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, params, body }, response, next)

      const expectedErrors = {
        arrivalDate: 'You must enter a arrival date',
      }
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
        errors: expectedErrors,
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })
})
