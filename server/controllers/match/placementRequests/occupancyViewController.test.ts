import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { when } from 'jest-when'
import { addDays } from 'date-fns'
import { PlacementCriteria } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SpaceSearchService } from '../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesFactory,
  placementRequestDetailFactory,
  spaceSearchStateFactory,
} from '../../../testutils/factories'
import OccupancyViewController from './occupancyViewController'
import { occupancySummary, placementDates } from '../../../utils/match'
import matchPaths from '../../../paths/match'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import * as validationUtils from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import {
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
  dayAvailabilitySummaryListItems,
  durationSelectOptions,
  occupancyCriteriaMap,
} from '../../../utils/match/occupancy'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import { ValidationError } from '../../../utils/errors'
import { filterRoomLevelCriteria, initialiseSearchState } from '../../../utils/match/spaceSearch'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'
import { createQueryString, makeArrayOfType } from '../../../utils/utils'

describe('OccupancyViewController', () => {
  const token = 'SOME_TOKEN'

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const spaceSearchService = createMock<SpaceSearchService>({})

  let occupancyViewController: OccupancyViewController
  const premises = cas1PremisesFactory.build()
  const placementRequestDetail = placementRequestDetailFactory.build({ duration: 84 })
  const searchState = initialiseSearchState(placementRequestDetail)
  const premiseCapacity = cas1PremiseCapacityFactory.build()

  let request: Readonly<DeepMocked<Request>>
  const mockSessionSave = jest.fn().mockImplementation((callback: () => void) => callback())

  const params = { id: placementRequestDetail.id, premisesId: premises.id }

  const occupancyViewUrl = matchPaths.v2Match.placementRequests.search.occupancy(params)
  const placeholderDetailsUrl = `${matchPaths.v2Match.placementRequests.search.dayOccupancy({
    id: placementRequestDetail.id,
    premisesId: premises.id,
    date: ':date',
  })}?${createQueryString({ criteria: searchState.roomCriteria }, { arrayFormat: 'repeat' })}`

  beforeEach(() => {
    jest.clearAllMocks()

    occupancyViewController = new OccupancyViewController(placementRequestService, premisesService, spaceSearchService)
    request = createMock<Request>({
      params,
      user: { token },
      flash: jest.fn(),
      headers: {
        referer: '/referrerPath',
      },
      session: {
        save: mockSessionSave,
      },
    })

    placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(premiseCapacity)
    spaceSearchService.getSpaceSearchState.mockReturnValue(searchState)
  })

  describe('view', () => {
    it('should render the occupancy view template with the search state details', async () => {
      const requestHandler = occupancyViewController.view()
      await requestHandler(request, response, next)

      const { startDate: requestedArrivalDate, endDate: requestedDepartureDate } = placementDates(
        placementRequestDetail.expectedArrival,
        placementRequestDetail.duration,
      )

      expect(spaceSearchService.getSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session)
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
      expect(premisesService.find).toHaveBeenCalledWith(token, premises.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: searchState.startDate,
        endDate: DateFormats.dateObjToIsoDate(addDays(searchState.startDate, searchState.durationDays)),
      })

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest: placementRequestDetail,
        requestedArrivalDate,
        requestedDepartureDate,
        premises,
        ...searchState,
        ...DateFormats.isoDateToDateInputs(searchState.startDate, 'startDate'),
        durationOptions: durationSelectOptions(searchState.durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, searchState.roomCriteria),
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequestDetail, { showActions: false }),
        summary: occupancySummary(premiseCapacity.capacity, searchState.roomCriteria),
        calendar: occupancyCalendar(premiseCapacity.capacity, placeholderDetailsUrl, searchState.roomCriteria),
        errors: {},
        errorSummary: [],
      })
    })

    it('should redirect to the suitability search if there is no search state in session', async () => {
      spaceSearchService.getSpaceSearchState.mockReturnValue(undefined)

      const requestHandler = occupancyViewController.view()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        matchPaths.v2Match.placementRequests.search.spaces({ id: params.id }),
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
        'startDate-day': '32',
        'startDate-month': '2',
        'startDate-year': '2025',
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
      spaceSearchService.getSpaceSearchState.mockReturnValue(fullSearchState)

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
      'startDate-day': '23',
      'startDate-month': '3',
      'startDate-year': '2025',
      roomCriteria: ['isArsonSuitable', 'hasEnSuite', 'isSingle'],
      durationDays: '42',
    }

    it('saves the submitted filters in the search state and redirects to the view', async () => {
      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBody }, response, next)

      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
        startDate: '2025-03-23',
        roomCriteria: ['isArsonSuitable', 'hasEnSuite', 'isSingle'],
        durationDays: 42,
      })
      expect(mockSessionSave).toHaveBeenCalled()
      expect(response.redirect).toHaveBeenCalledWith(occupancyViewUrl)
    })

    it('clears the selected room criteria when none are selected', async () => {
      const filterBodyNoCriteria: Request['body'] = {
        ...filterBody,
        roomCriteria: undefined,
      }

      const requestHandler = occupancyViewController.filterView()
      await requestHandler({ ...request, body: filterBodyNoCriteria }, response, next)

      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(
        placementRequestDetail.id,
        request.session,
        expect.objectContaining({
          roomCriteria: [],
        }),
      )
    })

    it.each([
      ['empty', { 'startDate-day': '', 'startDate-month': '', 'startDate-year': '' }],
      ['invalid', { 'startDate-day': '45', 'startDate-month': '14', 'startDate-year': '23' }],
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
      expect(spaceSearchService.setSpaceSearchState).not.toHaveBeenCalled()

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

      expect(spaceSearchService.setSpaceSearchState).toHaveBeenCalledWith(placementRequestDetail.id, request.session, {
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
    it('should render the day occupancy view template with given approved premises, date and room requirement criteria', async () => {
      const date = '2025-03-23'
      const criteria: Array<PlacementCriteria> = [
        'isWheelchairDesignated',
        'isArsonSuitable',
        'acceptsNonSexualChildOffenders',
      ]

      const dayCapacity = cas1PremiseCapacityForDayFactory.build({})
      const premisesCapacityForDay = cas1PremiseCapacityFactory.build({
        startDate: date,
        endDate: date,
        capacity: [dayCapacity],
      })
      when(premisesService.getCapacity)
        .calledWith(request.user.token, premises.id, { startDate: date })
        .mockResolvedValue(premisesCapacityForDay)

      const query = {
        criteria,
      }

      const requestHandler = occupancyViewController.viewDay()

      await requestHandler({ ...request, params: { ...params, date }, query }, response, next)

      const expectedStatus = dayAvailabilityStatus(dayCapacity, filterRoomLevelCriteria(makeArrayOfType(criteria)))

      expect(premisesService.getCapacity).toHaveBeenCalledWith('SOME_TOKEN', premises.id, { startDate: date })
      expect(response.render).toHaveBeenCalledWith('match/placementRequests/occupancyView/viewDay', {
        backLink: '/referrerPath',
        pageHeading: dayAvailabilityStatusMap[expectedStatus],
        placementRequest: placementRequestDetail,
        premises,
        date,
        status: expectedStatus,
        availabilitySummaryListItems: dayAvailabilitySummaryListItems(
          dayCapacity,
          filterRoomLevelCriteria(makeArrayOfType(criteria)),
        ),
      })
    })

    it('should fetch capacity data with a placement id to exclude', async () => {
      const date = '2025-03-23'
      const criteria: Array<PlacementCriteria> = ['isWheelchairDesignated']
      const excludeSpaceBookingId = 'excluded-id'

      const dayCapacity = cas1PremiseCapacityForDayFactory.build({})
      const premisesCapacityForDay = cas1PremiseCapacityFactory.build({
        startDate: date,
        endDate: date,
        capacity: [dayCapacity],
      })
      when(premisesService.getCapacity)
        .calledWith(request.user.token, premises.id, { startDate: date, excludeSpaceBookingId })
        .mockResolvedValue(premisesCapacityForDay)

      const query = {
        criteria,
        excludeSpaceBookingId,
      }

      const requestHandler = occupancyViewController.viewDay()

      await requestHandler({ ...request, params: { ...params, date }, query }, response, next)

      expect(premisesService.getCapacity).toHaveBeenCalledWith('SOME_TOKEN', premises.id, {
        startDate: date,
        excludeSpaceBookingId,
      })
    })
  })
})
