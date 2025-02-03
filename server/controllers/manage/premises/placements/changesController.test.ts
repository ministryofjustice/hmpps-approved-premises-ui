import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
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
import { placementDatesSummary, placementOverviewSummary } from '../../../../utils/placements'
import { filterRoomLevelCriteria } from '../../../../utils/match/spaceSearch'
import { createQueryString, makeArrayOfType } from '../../../../utils/utils'
import { durationSelectOptions, occupancyCriteriaMap } from '../../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'
import { DateFormats } from '../../../../utils/dateUtils'
import * as validationUtils from '../../../../utils/validation'
import { ValidationError } from '../../../../utils/errors'

describe('changesController', () => {
  const token = 'SOME_TOKEN'

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
      flash: jest.fn(),
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
        pageHeading: 'Change placement dates',
        placement,
        placementSummary: placementOverviewSummary(placement),
        placementDatesSummary: placementDatesSummary(placement),
        durationOptions: durationSelectOptions(expectedDuration),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, expectedCriteria),
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
            criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, filterCriteria),
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
            criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, []),
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
    it('should redirect to the confirmation screen with criteria when the submitted dates are valid', async () => {
      const body = {
        'arrivalDate-day': '23',
        'arrivalDate-month': '6',
        'arrivalDate-year': '2025',
        'departureDate-day': '13',
        'departureDate-month': '8',
        'departureDate-year': '2025',
        criteria: 'hasEnSuite,isArsonDesignated',
      }

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
      await requestHandler({ ...request, body }, response, next)

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
    it('renders the confirmation page with new booking information', async () => {
      const query = {
        arrivalDate: '2025-04-14',
        departureDate: '2025-06-02',
        criteria: ['hasEnSuite', 'isStepFreeDesignated'],
      }

      const requestHandler = changesController.confirm()
      await requestHandler({ ...request, query }, response, next)

      const expectedBackLink = `${managePaths.premises.placements.changes.new({
        premisesId: premises.id,
        placementId: placement.id,
      })}?criteria=hasEnSuite&criteria=isStepFreeDesignated&arrivalDate=2025-04-14&departureDate=2025-06-02`

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/changes/confirm', {
        pageHeading: 'Confirm booking changes',
        backlink: expectedBackLink,
        placement,
        summaryListRows: spaceBookingConfirmationSummaryListRows(
          premises,
          query.arrivalDate,
          query.departureDate,
          query.criteria as Array<Cas1SpaceBookingCharacteristic>,
        ),
      })
    })
  })
})
