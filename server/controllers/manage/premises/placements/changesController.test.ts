import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction, Request, Response } from 'express'
import { Cas1SpaceBookingCharacteristic, Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { addDays } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../testutils/factories'
import ChangesController from './changesController'
import { occupancySummary, spaceBookingConfirmationSummaryListRows } from '../../../../utils/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import managePaths from '../../../../paths/manage'
import { placementKeyDetails, placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { durationSelectOptions } from '../../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { DateFormats } from '../../../../utils/dateUtils'
import * as validationUtils from '../../../../utils/validation'
import * as backlinkUtils from '../../../../utils/backlinks'
import { ValidationError } from '../../../../utils/errors'
import { roomCharacteristicMap, roomCharacteristicsInlineList } from '../../../../utils/characteristicsUtils'

describe('changesController', () => {
  const token = 'TEST_TOKEN'

  const mockFlash = jest.fn()
  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const premisesService = createMock<PremisesService>()
  const changesController = new ChangesController(placementService, premisesService)

  const premises = cas1PremisesFactory.build()
  const placement = cas1SpaceBookingFactory
    .upcoming()
    .build({ premises, expectedArrivalDate: '2025-10-02', expectedDepartureDate: '2025-11-02' })
  const capacity = cas1PremiseCapacityFactory.build()
  const params = { premisesId: premises.id, placementId: placement.id }
  const viewUrl = managePaths.premises.placements.changes.new(params)
  const basePlaceholderDetailsUrl = managePaths.premises.placements.changes.dayOccupancy({
    placementId: placement.id,
    premisesId: premises.id,
    date: ':date',
  })

  beforeEach(() => {
    jest.clearAllMocks()

    placementService.getPlacement.mockResolvedValue(placement)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(capacity)
    jest.spyOn(backlinkUtils, 'getPageBackLink').mockReturnValue('/backlink')
    request = createMock<Request>({
      user: { token },
      params,
      flash: mockFlash,
      query: {},
    })
  })

  describe('new', () => {
    it('renders the change placement screen with current booking information', async () => {
      await changesController.new()(request, response, next)

      const expectedCriteria = filterRoomLevelCriteria(placement.characteristics)
      const expectedPlaceholderDayUrl = `${basePlaceholderDetailsUrl}${createQueryString(
        { criteria: expectedCriteria },
        {
          arrayFormat: 'repeat',
          addQueryPrefix: true,
        },
      )}`
      const expectedDuration = 31

      expect(backlinkUtils.getPageBackLink).toHaveBeenCalledWith(
        '/manage/premises/:premisesId/placements/:placementId/changes/new',
        request,
        [
          '/manage/resident/:crn/placement/:placementId{/*tab}',
          '/manage/premises/:premisesId/placements/:placementId',
          '/admin/placement-requests/:placementRequestId',
          '/admin/placement-requests/:placementRequestId/select-placement',
        ],
        `/admin/placement-requests/${placement.placementRequestId}`,
      )
      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: placement.expectedArrivalDate,
        endDate: DateFormats.dateObjToIsoDate(addDays(placement.expectedArrivalDate, expectedDuration - 1)),
        excludeSpaceBookingId: placement.id,
      })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes/new', {
        backlink: '/backlink',
        pageHeading: 'Change placement',
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        selectedCriteria: roomCharacteristicsInlineList(expectedCriteria, 'no room criteria'),
        arrivalDateHint: `Current arrival date: ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Current departure date: ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
        placementSummary: placementOverviewSummary(placement),
        durationOptions: durationSelectOptions(expectedDuration),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, expectedCriteria),
        startDate: DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'datePicker' }),
        durationDays: expectedDuration,
        criteria: expectedCriteria,
        calendarHeading: 'Showing 4 weeks, 3 days from 2 Oct 2025',
        summary: occupancySummary(capacity.capacity, expectedCriteria),
        calendar: occupancyCalendar(capacity.capacity, expectedPlaceholderDayUrl, expectedCriteria),
        errorSummary: [],
        errors: {},
      })
    })

    describe('when filtering the view', () => {
      it('renders the change placement screen with a filtered view', async () => {
        const query = {
          startDate: '12/5/2025',
          durationDays: '7',
          criteria: 'hasEnSuite',
        }

        const filterCriteria = makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.criteria)

        const requestHandler = changesController.new()
        await requestHandler({ ...request, query }, response, next)

        const expectedPlaceholderDayUrl = `${basePlaceholderDetailsUrl}?${createQueryString({
          criteria: filterCriteria,
        })}`

        expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
          startDate: '2025-05-12',
          endDate: '2025-05-18',
          excludeSpaceBookingId: placement.id,
        })
        expect(response.render.mock.lastCall[1]).toEqual(
          expect.objectContaining({
            summary: occupancySummary(capacity.capacity, filterCriteria),
            calendarHeading: 'Showing 1 week from 12 May 2025',
            calendar: occupancyCalendar(capacity.capacity, expectedPlaceholderDayUrl, filterCriteria),
            durationOptions: durationSelectOptions(Number(query.durationDays)),
            criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, filterCriteria),
            startDate: '12/5/2025',
          }),
        )
      })

      it('shows an error and does not display summary or calendar if the filter date is invalid', async () => {
        const query = {
          startDate: '12/14/2024',
          durationDays: '7',
        }

        const requestHandler = changesController.new()
        await requestHandler({ ...request, query }, response, next)

        expect(premisesService.getCapacity).not.toHaveBeenCalled()
        expect(response.render.mock.lastCall[1]).toEqual(
          expect.objectContaining({
            summary: undefined,
            calendar: undefined,
            durationOptions: durationSelectOptions(Number(query.durationDays)),
            criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, []),
            errorSummary: [{ text: 'Enter a valid date', href: '#startDate' }],
            errors: {
              startDate: {
                attributes: { 'data-cy-error-startDate': true },
                text: 'Enter a valid date',
              },
            },
            startDate: '12/14/2024',
          }),
        )
      })
    })
  })

  describe('saveNew', () => {
    const validBody = {
      'arrivalDate-day': '23',
      'arrivalDate-month': '6',
      'arrivalDate-year': '2025',
      'departureDate-day': '13',
      'departureDate-month': '8',
      'departureDate-year': '2025',
      criteria: 'hasEnSuite,isArsonSuitable',
    }

    it('should redirect to the confirmation screen with criteria when the submitted dates are valid', async () => {
      const expectedRedirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
        {
          arrivalDate: '2025-06-23',
          departureDate: '2025-08-13',
          criteria: ['hasEnSuite', 'isArsonSuitable'],
        },
        {
          arrayFormat: 'repeat',
        },
      )}`

      const requestHandler = changesController.saveNew()
      await requestHandler({ ...request, body: validBody }, response, next)

      expect(response.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
    })

    it('should include the current filtering query in the redirect', async () => {
      const query = {
        'startDate-day': '12',
        'startDate-month': '5',
        'startDate-year': '2025',
        durationDays: '7',
        criteria: ['hasEnSuite', 'isArsonSuitable'],
      }

      const expectedRedirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
        {
          ...query,
          arrivalDate: '2025-06-23',
          departureDate: '2025-08-13',
          criteria: ['hasEnSuite', 'isArsonSuitable'],
        },
        {
          arrayFormat: 'repeat',
        },
      )}`

      const requestHandler = changesController.saveNew()
      await requestHandler({ ...request, body: validBody, query }, response, next)

      expect(response.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
    })

    describe('when there are errors', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
      })

      it(`should redirect to the view when dates are empty`, async () => {
        const body = {}
        const query = {
          criteria: ['hasEnSuite', 'isArsonSuitable'],
        }
        const requestWithBody = { ...request, body, query }

        await changesController.saveNew()(requestWithBody, response, next)

        const expectedErrorData = {
          arrivalDate: 'You must enter an arrival date',
          departureDate: 'You must enter a departure date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          requestWithBody,
          response,
          new ValidationError({}),
          `${viewUrl}?criteria=hasEnSuite&criteria=isArsonSuitable`,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to the view when dates are invalid`, async () => {
        const requestWithBody = {
          ...request,
          body: {
            'arrivalDate-day': '31',
            'arrivalDate-month': '02',
            'arrivalDate-year': '2025',
            'departureDate-day': '34',
            'departureDate-month': '05',
            'departureDate-year': '19999',
          },
        }

        await changesController.saveNew()(requestWithBody, response, next)

        const expectedErrorData = {
          arrivalDate: 'The arrival date is an invalid date',
          departureDate: 'The departure date is an invalid date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          requestWithBody,
          response,
          new ValidationError({}),
          viewUrl,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to the view when the departure date is before the arrival date`, async () => {
        const requestWithBody = {
          ...request,
          body: {
            'arrivalDate-day': '28',
            'arrivalDate-month': '01',
            'arrivalDate-year': '2025',
            'departureDate-day': '27',
            'departureDate-month': '01',
            'departureDate-year': '2025',
          },
        }

        const requestHandler = changesController.saveNew()
        await requestHandler(requestWithBody, response, next)

        const expectedErrorData = {
          departureDate: 'The departure date must be after the arrival date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          requestWithBody,
          response,
          new ValidationError({}),
          viewUrl,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })
    })
  })

  describe('confirm', () => {
    it.each([
      ['with criteria', ['hasEnSuite', 'isStepFreeDesignated']],
      ['with one criterion', 'hasEnSuite'],
      ['with no criteria', undefined],
    ])('renders the confirmation page with new booking information %s', async (_, criteria) => {
      const query = {
        'startDate-day': '12',
        'startDate-month': '5',
        'startDate-year': '2025',
        durationDays: '7',
        arrivalDate: '2025-04-14',
        departureDate: '2025-06-02',
        criteria,
      }

      const requestHandler = changesController.confirm()
      await requestHandler({ ...request, query }, response, next)

      const expectedBackLink = `${managePaths.premises.placements.changes.new({
        premisesId: premises.id,
        placementId: placement.id,
      })}?${createQueryString(query, { arrayFormat: 'repeat' })}`

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes/confirm', {
        pageHeading: 'Confirm booking changes',
        backlink: expectedBackLink,
        contextKeyDetails: placementKeyDetails(placement),
        summaryListRows: spaceBookingConfirmationSummaryListRows({
          premises,
          expectedArrivalDate: query.arrivalDate,
          expectedDepartureDate: query.departureDate,
          criteria: query.criteria ? makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.criteria) : [],
        }),
        arrivalDate: query.arrivalDate,
        departureDate: query.departureDate,
        criteria: query.criteria,
        errorSummary: [],
        errors: {},
      })
    })
  })

  describe('create', () => {
    const body = {
      arrivalDate: '2025-05-05',
      departureDate: '2025-07-05',
      criteria: 'isSuitedForSexOffenders,isStepFreeDesignated',
    }

    it('updates the placement and redirects the user to the placement request', async () => {
      placementService.updatePlacement.mockResolvedValue({})
      const requestWithBody = { ...request, body }

      await changesController.create()(requestWithBody, response, next)

      const expectedUpdateBody: Cas1UpdateSpaceBooking = {
        arrivalDate: '2025-05-05',
        departureDate: '2025-07-05',
        characteristics: ['isSuitedForSexOffenders', 'isStepFreeDesignated'],
      }

      expect(placementService.updatePlacement).toHaveBeenCalledWith(
        token,
        params.premisesId,
        params.placementId,
        expectedUpdateBody,
      )
      expect(placementService.getPlacement).toHaveBeenCalledWith(token, params.placementId)
      expect(mockFlash).toHaveBeenCalledWith('success', 'Booking changed successfully')
      expect(response.redirect).toHaveBeenCalledWith('/backlink')
    })

    it('redirects the user to the placement for an offline placement', async () => {
      placementService.updatePlacement.mockResolvedValue({})
      placementService.getPlacement.mockResolvedValue({ ...placement, placementRequestId: undefined })

      await changesController.create()({ ...request, body }, response, next)

      expect(mockFlash).toHaveBeenCalledWith('success', 'Booking changed successfully')
      expect(response.redirect).toHaveBeenCalledWith('/backlink')
    })

    it('updates the placement with empty criteria', async () => {
      const bodyNoCriteria = {
        ...body,
        criteria: '',
      }

      const requestHandler = changesController.create()
      await requestHandler({ ...request, body: bodyNoCriteria }, response, next)

      const expectedUpdateBody: Cas1UpdateSpaceBooking = {
        arrivalDate: '2025-05-05',
        departureDate: '2025-07-05',
        characteristics: [],
      }

      expect(placementService.updatePlacement).toHaveBeenCalledWith(
        token,
        params.premisesId,
        params.placementId,
        expectedUpdateBody,
      )
    })

    describe('when errors are raised by the API', () => {
      beforeEach(() => {
        jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue()
      })

      it('redirects to the confirm screen with existing query string', async () => {
        const apiError = new Error()
        placementService.updatePlacement.mockRejectedValue(apiError)

        const requestWithBody = { ...request, body }

        const requestHandler = changesController.create()
        await requestHandler(requestWithBody, response, next)

        const expectedRedirect = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
          {
            arrivalDate: '2025-05-05',
            departureDate: '2025-07-05',
            criteria: ['isSuitedForSexOffenders', 'isStepFreeDesignated'],
          },
          { arrayFormat: 'repeat' },
        )}`

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          requestWithBody,
          response,
          apiError,
          expectedRedirect,
        )
      })
    })
  })
})
