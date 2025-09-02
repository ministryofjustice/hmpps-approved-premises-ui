import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import { addDays } from 'date-fns'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import { PlacementRequestService, PlacementService, PremisesService, SessionService } from '../../../services'
import {
  cas1PlacementRequestDetailFactory,
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesDaySummaryFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'
import { occupancySummary, placementDates } from '../../../utils/match'
import matchPaths from '../../../paths/match'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import * as validationUtils from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatusForCriteria,
  dayAvailabilityStatusMap,
  durationSelectOptions,
} from '../../../utils/match/occupancy'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'
import { filterRoomLevelCriteria, initialiseSearchState } from '../../../utils/match/spaceSearch'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'
import {
  type OutOfServiceBedColumnField,
  type PlacementColumnField,
  daySummaryRows,
  outOfServiceBedColumnMap,
  outOfServiceBedTableRows,
  placementColumnMap,
  placementTableRows,
  tableHeader,
  tableCaptions,
} from '../../../utils/premises/occupancy'
import { roomCharacteristicMap, roomCharacteristicsInlineList } from '../../../utils/characteristicsUtils'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'
import { placementKeyDetails } from '../../../utils/placements'
import cas1RequestedPlacementPeriodFactory from '../../../testutils/factories/cas1RequestedPlacementPeriod'

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const sessionService = createMock<SessionService>()
  const placementService = createMock<PlacementService>({})

  let occupancyViewController: OccupancyViewController
  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
    authorisedPlacementPeriod: cas1RequestedPlacementPeriodFactory.build({ duration: 84 }),
  })
  const searchState = initialiseSearchState(placementRequestDetail)
  const premiseCapacity = cas1PremiseCapacityFactory.build()

  let request: Readonly<DeepMocked<Request>>
  const mockSessionSave = jest.fn().mockImplementation((callback: () => void) => callback())

  const params = { placementRequestId: placementRequestDetail.id, premisesId: premises.id }

  const occupancyViewUrl = matchPaths.v2Match.placementRequests.search.occupancy(params)
  const placeholderDetailsUrl = `${matchPaths.v2Match.placementRequests.search.dayOccupancy({
    placementRequestId: placementRequestDetail.id,
    premisesId: premises.id,
    date: ':date',
  })}${createQueryString({ criteria: searchState.roomCriteria }, { arrayFormat: 'repeat', addQueryPrefix: true })}`

  beforeEach(() => {
    jest.clearAllMocks()

    occupancyViewController = new OccupancyViewController(
      placementRequestService,
      premisesService,
      sessionService,
      placementService,
    )
    request = createMock<Request>({
      params,
      user: { token },
      flash: jest.fn(),
      headers: {
        referer: '/referrerPath',
      },
      session: {
        save: mockSessionSave,
        multiPageFormData: {
          spaceSearch: {
            [placementRequestDetail.id]: searchState,
          },
        },
      },
    })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(premiseCapacity)
    sessionService.getPageBackLink.mockReturnValue('/backlink')

    jest.spyOn(occupancyViewController.formData, 'get')
    jest.spyOn(occupancyViewController.formData, 'update')
  })

  describe('view', () => {
    it('should render the occupancy view template with the search state details', async () => {
      await occupancyViewController.view()(request, response, next)

      const { startDate, endDate } = placementDates(
        placementRequestDetail.authorisedPlacementPeriod.arrival,
        placementRequestDetail.authorisedPlacementPeriod.duration,
      )

      expect(occupancyViewController.formData.get).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: searchState.startDate,
        endDate: DateFormats.dateObjToIsoDate(addDays(searchState.startDate, searchState.durationDays - 1)),
      })

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        contextKeyDetails: placementRequestKeyDetails(placementRequestDetail),
        placementRequest: placementRequestDetail,
        selectedCriteria: roomCharacteristicsInlineList(searchState.roomCriteria, 'no room criteria'),
        arrivalDateHint: `Requested arrival date: ${DateFormats.isoDateToUIDate(startDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Requested departure date: ${DateFormats.isoDateToUIDate(endDate, { format: 'dateFieldHint' })}`,
        premises,
        ...searchState,
        startDate: DateFormats.isoDateToUIDate(searchState.startDate, { format: 'datePicker' }),
        startDateIso: searchState.startDate,
        durationOptions: durationSelectOptions(searchState.durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, searchState.roomCriteria),
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequestDetail, { showActions: false }),
        summary: occupancySummary(premiseCapacity.capacity, searchState.roomCriteria),
        calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl, searchState.roomCriteria),
        errors: {},
        errorSummary: [],
      })
    })

    it('should redirect to the suitability search if there is no search state in session', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = occupancyViewController.view()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId: params.placementRequestId }),
      )
    })

    it('should render the occupancy view template with booking errors', async () => {
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

      await requestHandler(request, response, next)

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
          calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl, searchState.roomCriteria),
          summary: occupancySummary(premiseCapacity.capacity, searchState.roomCriteria),
        }),
      )
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })

    it('should show an error if the filter date is invalid, and not show the calendar or summary', async () => {
      const expectedErrors = {
        startDate: {
          attributes: { 'data-cy-error-startDate': true },
          text: 'Enter a valid date',
        },
      }
      const expectedErrorSummary = [{ text: 'Enter a valid date', href: '#startDate' }]
      const expectedUserInput = {
        startDate: '32/2/2025',
      }
      jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue({
        errors: expectedErrors,
        errorSummary: expectedErrorSummary,
        userInput: expectedUserInput,
      })

      const requestHandler = occupancyViewController.view()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/placementRequests/occupancyView/view',
        expect.objectContaining({
          errors: expectedErrors,
          errorSummary: expectedErrorSummary,
          ...expectedUserInput,
          summary: undefined,
          calendar: undefined,
        }),
      )
      expect(premisesService.getCapacity).not.toHaveBeenCalled()
    })

    it('should render the occupancy view with the arrival and departure dates populated if the user has come back from confirm', async () => {
      const fullSearchState = spaceSearchStateFactory.build()
      request.session.multiPageFormData.spaceSearch[placementRequestDetail.id] = fullSearchState

      const requestHandler = occupancyViewController.view()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'match/placementRequests/occupancyView/view',
        expect.objectContaining({
          ...DateFormats.isoDateToDateInputs(fullSearchState.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoDateToDateInputs(fullSearchState.departureDate, 'departureDate'),
        }),
      )
    })
  })

  describe('filterView', () => {
    const filterBody: Request['body'] = {
      startDate: '23/3/2025',
      roomCriteria: ['isArsonSuitable', 'hasEnSuite', 'isSingle'],
      durationDays: '42',
    }

    it('saves the submitted filters in the search state and redirects to the view', async () => {
      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBody }, response, next)

      expect(occupancyViewController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        startDate: '2025-03-23',
        roomCriteria: ['isArsonSuitable', 'hasEnSuite', 'isSingle'],
        durationDays: 42,
      })
      expect(mockSessionSave).toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(occupancyViewUrl)
    })

    it('saves an array of a single room criterion if only one is selected and is posted as a string (APS-1957)', async () => {
      const filterBodyOneCriterion: Request['body'] = {
        ...filterBody,
        roomCriteria: 'isArsonSuitable',
      }
      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBodyOneCriterion }, response, next)

      expect(occupancyViewController.formData.update).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        expect.objectContaining({
          roomCriteria: ['isArsonSuitable'],
        }),
      )
    })

    it('clears the selected room criteria when none are selected', async () => {
      const filterBodyNoCriteria: Request['body'] = {
        ...filterBody,
        roomCriteria: undefined,
      }

      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBodyNoCriteria }, response, next)

      expect(occupancyViewController.formData.update).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        expect.objectContaining({
          roomCriteria: [],
        }),
      )
    })

    it.each([
      ['empty', { startDate: '' }],
      ['invalid', { startDate: '45/14/23' }],
    ])('returns an error if the start date is %s', async (_, dateInput) => {
      jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate')

      const filterBodyNoStartDate: Request['body'] = {
        ...filterBody,
        ...dateInput,
      }

      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBodyNoStartDate }, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        occupancyViewUrl,
      )
      expect(occupancyViewController.formData.update).not.toHaveBeenCalled()

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        startDate: 'Enter a valid date',
      })
    })
  })

  describe('bookSpace', () => {
    const validBookingBody = {
      'arrivalDate-day': '11',
      'arrivalDate-month': '2',
      'arrivalDate-year': '2026',
      'departureDate-day': '21',
      'departureDate-month': '2',
      'departureDate-year': '2026',
    }

    it(`should set the state search dates and redirect to space-booking confirmation page when date validation succeeds`, async () => {
      const requestHandler = occupancyViewController.bookSpace()
      await requestHandler({ ...request, body: validBookingBody }, response, next)

      expect(occupancyViewController.formData.update).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        arrivalDate: '2026-02-11',
        departureDate: '2026-02-21',
      })
      expect(mockSessionSave).toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(matchPaths.v2Match.placementRequests.spaceBookings.new(params))
    })

    describe('when there are errors', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
      })

      it(`should redirect to occupancy view when dates are empty`, async () => {
        const body = {}

        const requestHandler = occupancyViewController.bookSpace()
        await requestHandler({ ...request, body }, response, next)

        const expectedErrorData = {
          arrivalDate: 'You must enter an arrival date',
          departureDate: 'You must enter a departure date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          occupancyViewUrl,
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
        await requestHandler({ ...request, body }, response, next)

        const expectedErrorData = {
          arrivalDate: 'The arrival date is an invalid date',
          departureDate: 'The departure date is an invalid date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          occupancyViewUrl,
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
        await requestHandler({ ...request, body }, response, next)

        const expectedErrorData = {
          departureDate: 'The departure date must be after the arrival date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          occupancyViewUrl,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })
    })
  })

  describe('viewDay', () => {
    const date = '2025-03-23'
    const premisesDaySummary = cas1PremisesDaySummaryFactory.build({ forDate: date })
    const placement = cas1SpaceBookingFactory.build()

    const dayCapacity = cas1PremiseCapacityForDayFactory.build()
    const premisesCapacityForDay = cas1PremiseCapacityFactory.build({
      startDate: date,
      endDate: date,
      capacity: [dayCapacity],
    })

    beforeEach(() => {
      premisesService.getDaySummary.mockResolvedValue(premisesDaySummary)
      when(premisesService.getCapacity)
        .calledWith(request.user.token, premises.id, { startDate: date })
        .mockResolvedValue(premisesCapacityForDay)

      when(premisesService.getCapacity)
        .calledWith(request.user.token, premises.id, { startDate: date, excludeSpaceBookingId: placement.id })
        .mockResolvedValue(premisesCapacityForDay)

      placementService.getPlacement.mockResolvedValue(placement)
    })

    describe.each([
      [
        'for a placement request to help with Find & Book',
        { premisesId: premises.id, placementRequestId: placementRequestDetail.id, date },
        {
          pathPrefix: `/match/placement-requests/${placementRequestDetail.id}/space-search/occupancy/${premises.id}/date`,
          getCapacityArgs: { startDate: date },
          keyDetails: placementRequestKeyDetails(placementRequestDetail),
        },
      ],
      [
        'for a placement to help with changing a placement',
        { premisesId: premises.id, placementId: placement.id, date },
        {
          pathPrefix: `/manage/premises/${premises.id}/placements/${placement.id}/changes/occupancy/date`,
          getCapacityArgs: { startDate: date, excludeSpaceBookingId: placement.id },
          keyDetails: placementKeyDetails(placement),
        },
      ],
      [
        'for a premises only to help with general availability',
        { premisesId: premises.id, date },
        {
          pathPrefix: `/admin/national-occupancy/premises/${premises.id}/date`,
          getCapacityArgs: { startDate: date },
          keyDetails: undefined,
        },
      ],
    ])('when rendering %s', (_, requestParams, expected) => {
      const { pathPrefix, getCapacityArgs, keyDetails } = expected
      const expectedStatus = dayAvailabilityStatusForCriteria(dayCapacity, [])
      const defaultRenderParameters = {
        pageHeading: 'Sun 23 Mar 2025',
        contextKeyDetails: keyDetails,
        backLink: '/backlink',
        dayAvailabilityStatus: dayAvailabilityStatusMap[expectedStatus],
        daySummaryRows: daySummaryRows(dayCapacity, [], 'singleRow'),
        premises,
        nextDayLink: `${pathPrefix}/2025-03-24`,
        previousDayLink: `${pathPrefix}/2025-03-22`,
        ...tableCaptions(premisesDaySummary, [], true),
        outOfServiceBedTableHeader: tableHeader<OutOfServiceBedColumnField>(outOfServiceBedColumnMap),
        outOfServiceBedTableRows: outOfServiceBedTableRows(premises.id, premisesDaySummary.outOfServiceBeds),
        placementTableHeader: tableHeader<PlacementColumnField>(
          placementColumnMap,
          'canonicalArrivalDate',
          undefined,
          `${pathPrefix}/2025-03-23`,
        ),
        placementTableRows: placementTableRows(premises.id, premisesDaySummary.spaceBookingSummaries),
      }

      it('should render the day occupancy with default sort', async () => {
        await occupancyViewController.viewDay()({ ...request, params: requestParams, query: {} }, response, next)

        expect(premisesService.getCapacity).toHaveBeenCalledWith('SOME_TOKEN', premises.id, getCapacityArgs)

        expect(premisesService.getDaySummary).toHaveBeenCalledWith({
          bookingsSortBy: 'canonicalArrivalDate',
          bookingsSortDirection: 'asc',
          date,
          premisesId: premises.id,
          token,
        })

        expect(response.render).toHaveBeenCalledWith('manage/premises/occupancy/dayView', defaultRenderParameters)
      })

      it('should render the day occupancy with sorting and filtering', async () => {
        const criteria: Array<Cas1SpaceBookingCharacteristic> = ['isWheelchairDesignated', 'isArsonSuitable']
        const query = {
          sortBy: 'canonicalDepartureDate',
          sortDirection: 'desc',
          criteria: ['isWheelchairDesignated', 'isArsonSuitable'],
        }
        await occupancyViewController.viewDay()(
          {
            ...request,
            params: requestParams,
            query,
          },
          response,
          next,
        )

        const expectedFilteredStatus = dayAvailabilityStatusForCriteria(
          dayCapacity,
          filterRoomLevelCriteria(makeArrayOfType(query.criteria)),
        )
        const expectedQueryString = createQueryString({ ...query })

        expect(premisesService.getCapacity).toHaveBeenCalledWith('SOME_TOKEN', premises.id, getCapacityArgs)

        expect(premisesService.getDaySummary).toHaveBeenCalledWith({
          bookingsSortBy: 'canonicalDepartureDate',
          bookingsSortDirection: 'desc',
          date,
          premisesId: premises.id,
          token,
        })

        expect(response.render).toHaveBeenCalledWith('manage/premises/occupancy/dayView', {
          ...defaultRenderParameters,
          dayAvailabilityStatus: dayAvailabilityStatusMap[expectedFilteredStatus],
          daySummaryRows: daySummaryRows(dayCapacity, criteria, 'singleRow'),
          nextDayLink: `${pathPrefix}/2025-03-24?${expectedQueryString}`,
          previousDayLink: `${pathPrefix}/2025-03-22?${expectedQueryString}`,
          placementTableHeader: tableHeader<PlacementColumnField>(
            placementColumnMap,
            'canonicalDepartureDate',
            'desc',
            `${pathPrefix}/2025-03-23`,
          ),
        })
      })
    })
  })
})
