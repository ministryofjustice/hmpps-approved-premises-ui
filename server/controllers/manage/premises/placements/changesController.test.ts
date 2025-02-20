import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { Cas1SpaceBookingCharacteristic, Cas1UpdateSpaceBooking } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import { PlacementService, PremisesService } from '../../../../services'
import {
  cas1PremiseCapacityFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
} from '../../../../testutils/factories'
import ChangesController from './changesController'
import { occupancySummary, spaceBookingConfirmationSummaryListRows } from '../../../../utils/match'
import { occupancyCalendar } from '../../../../utils/match/occupancyCalendar'
import matchPaths from '../../../../paths/match'
import managePaths from '../../../../paths/manage'
import adminPaths from '../../../../paths/admin'
import { placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { durationSelectOptions } from '../../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { DateFormats } from '../../../../utils/dateUtils'
import * as validationUtils from '../../../../utils/validation'
import { ValidationError } from '../../../../utils/errors'
import { roomCharacteristicMap } from '../../../../utils/characteristicsUtils'

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
  const placement = cas1SpaceBookingFactory.upcoming().build({ premises })
  const capacity = cas1PremiseCapacityFactory.build()
  const params = { premisesId: premises.id, placementId: placement.id }
  const viewUrl = managePaths.premises.placements.changes.new(params)

  beforeEach(() => {
    jest.clearAllMocks()

    placementService.getPlacement.mockResolvedValue(placement)
    premisesService.find.mockResolvedValue(premises)
    premisesService.getCapacity.mockResolvedValue(capacity)
    request = createMock<Request>({
      user: { token },
      params,
      flash: mockFlash,
      query: {},
    })
  })

  describe('new', () => {
    it('renders the change placement screen with current booking information', async () => {
      const requestHandler = changesController.new()
      await requestHandler(request, response, next)

      const expectedCriteria = filterRoomLevelCriteria(placement.requirements.essentialCharacteristics)
      const expectedPlaceholderDayUrl = `${matchPaths.v2Match.placementRequests.search.dayOccupancy({
        id: placement.requestForPlacementId,
        premisesId: premises.id,
        date: ':date',
      })}?${createQueryString({ criteria: expectedCriteria, excludeSpaceBookingId: placement.id })}`
      const expectedDuration = differenceInDays(placement.expectedDepartureDate, placement.expectedArrivalDate)

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
        startDate: placement.expectedArrivalDate,
        endDate: placement.expectedDepartureDate,
        excludeSpaceBookingId: placement.id,
      })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes/new', {
        backlink: adminPaths.admin.placementRequests.show({ id: placement.requestForPlacementId }),
        pageHeading: 'Change placement',
        placement,
        selectedCriteria: expectedCriteria.map(criterion => roomCharacteristicMap[criterion]).join(', '),
        arrivalDateHint: `Expected arrival date: ${DateFormats.isoDateToUIDate(placement.expectedArrivalDate, { format: 'dateFieldHint' })}`,
        departureDateHint: `Expected departure date: ${DateFormats.isoDateToUIDate(placement.expectedDepartureDate, { format: 'dateFieldHint' })}`,
        placementSummary: placementOverviewSummary(placement),
        durationOptions: durationSelectOptions(expectedDuration),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, expectedCriteria),
        startDate: placement.expectedArrivalDate,
        ...DateFormats.isoDateToDateInputs(placement.expectedArrivalDate, 'startDate'),
        durationDays: expectedDuration,
        criteria: expectedCriteria,
        summary: occupancySummary(capacity.capacity, expectedCriteria),
        calendar: occupancyCalendar(capacity.capacity, expectedPlaceholderDayUrl, expectedCriteria),
        errorSummary: [],
        errors: {},
      })
    })

    describe('when filtering the view', () => {
      it('renders the change placement screen with a filtered view', async () => {
        const query = {
          'startDate-day': '12',
          'startDate-month': '5',
          'startDate-year': '2025',
          durationDays: '7',
          criteria: 'hasEnSuite',
        }

        const filterCriteria = makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.criteria)

        const requestHandler = changesController.new()
        await requestHandler({ ...request, query }, response, next)

        const placeholderDetailsUrl = `${matchPaths.v2Match.placementRequests.search.dayOccupancy({
          id: placement.requestForPlacementId,
          premisesId: premises.id,
          date: ':date',
        })}?${createQueryString({ criteria: filterCriteria, excludeSpaceBookingId: placement.id })}`

        expect(premisesService.getCapacity).toHaveBeenCalledWith(token, premises.id, {
          startDate: '2025-05-12',
          endDate: '2025-05-19',
          excludeSpaceBookingId: placement.id,
        })
        expect(response.render.mock.lastCall[1]).toEqual(
          expect.objectContaining({
            summary: occupancySummary(capacity.capacity, filterCriteria),
            calendar: occupancyCalendar(capacity.capacity, placeholderDetailsUrl, filterCriteria),
            durationOptions: durationSelectOptions(Number(query.durationDays)),
            criteriaOptions: convertKeyValuePairToCheckBoxItems(roomCharacteristicMap, filterCriteria),
            'startDate-day': '12',
            'startDate-month': '5',
            'startDate-year': '2025',
          }),
        )
      })

      it('shows an error and does not display summary or calendar if the filter date is invalid', async () => {
        const query = {
          'startDate-day': '12',
          'startDate-year': '2025',
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
            'startDate-day': '12',
            'startDate-year': '2025',
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
      criteria: 'hasEnSuite,isArsonDesignated',
    }

    it('should redirect to the confirmation screen with criteria when the submitted dates are valid', async () => {
      const expectedRedirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
        {
          arrivalDate: '2025-06-23',
          departureDate: '2025-08-13',
          criteria: ['hasEnSuite', 'isArsonDesignated'],
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
        criteria: ['hasEnSuite', 'isArsonDesignated'],
      }

      const expectedRedirectUrl = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
        {
          ...query,
          arrivalDate: '2025-06-23',
          departureDate: '2025-08-13',
          criteria: ['hasEnSuite', 'isArsonDesignated'],
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
          criteria: ['hasEnSuite', 'isArsonDesignated'],
        }

        const requestHandler = changesController.saveNew()
        await requestHandler({ ...request, body, query }, response, next)

        const expectedErrorData = {
          arrivalDate: 'You must enter an arrival date',
          departureDate: 'You must enter a departure date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          `${viewUrl}?criteria=hasEnSuite&criteria=isArsonDesignated`,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to the view when dates are invalid`, async () => {
        const body = {
          'arrivalDate-day': '31',
          'arrivalDate-month': '02',
          'arrivalDate-year': '2025',
          'departureDate-day': '34',
          'departureDate-month': '05',
          'departureDate-year': '19999',
        }

        const requestHandler = changesController.saveNew()
        await requestHandler({ ...request, body }, response, next)

        const expectedErrorData = {
          arrivalDate: 'The arrival date is an invalid date',
          departureDate: 'The departure date is an invalid date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          viewUrl,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it(`should redirect to the view when the departure date is before the arrival date`, async () => {
        const body = {
          'arrivalDate-day': '28',
          'arrivalDate-month': '01',
          'arrivalDate-year': '2025',
          'departureDate-day': '27',
          'departureDate-month': '01',
          'departureDate-year': '2025',
        }

        const requestHandler = changesController.saveNew()
        await requestHandler({ ...request, body }, response, next)

        const expectedErrorData = {
          departureDate: 'The departure date must be after the arrival date',
        }

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
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
        placement,
        summaryListRows: spaceBookingConfirmationSummaryListRows(
          premises,
          query.arrivalDate,
          query.departureDate,
          query.criteria ? makeArrayOfType<Cas1SpaceBookingCharacteristic>(query.criteria) : [],
        ),
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

      const requestHandler = changesController.create()
      await requestHandler({ ...request, body }, response, next)

      const expectedUpdateBody: Cas1UpdateSpaceBooking = {
        arrivalDate: '2025-05-05',
        departureDate: '2025-07-05',
        characteristics: ['isSuitedForSexOffenders', 'isStepFreeDesignated'],
      }
      const expectedRedirectUrl = adminPaths.admin.placementRequests.show({ id: placement.requestForPlacementId })

      expect(placementService.updatePlacement).toHaveBeenCalledWith(
        token,
        params.premisesId,
        params.placementId,
        expectedUpdateBody,
      )
      expect(placementService.getPlacement).toHaveBeenCalledWith(token, params.placementId)
      expect(mockFlash).toHaveBeenCalledWith('success', 'Booking changed successfully')
      expect(response.redirect).toHaveBeenCalledWith(expectedRedirectUrl)
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

        const requestHandler = changesController.create()
        await requestHandler({ ...request, body }, response, next)

        const expectedRedirect = `${managePaths.premises.placements.changes.confirm(params)}?${createQueryString(
          {
            arrivalDate: '2025-05-05',
            departureDate: '2025-07-05',
            criteria: ['isSuitedForSexOffenders', 'isStepFreeDesignated'],
          },
          { arrayFormat: 'repeat' },
        )}`

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          apiError,
          expectedRedirect,
        )
      })
    })
  })
})
