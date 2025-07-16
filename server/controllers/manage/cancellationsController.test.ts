import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { CancellationService, PlacementService } from '../../services'
import CancellationsController from './cancellationsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import {
  cas1NewSpaceBookingCancellationFactory,
  cas1SpaceBookingFactory,
  referenceDataFactory,
} from '../../testutils/factories'
import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import { canonicalDates } from '../../utils/placements'

jest.mock('../../utils/validation')

describe('cancellationsController', () => {
  const token = 'TEST_TOKEN'
  const placement = cas1SpaceBookingFactory.build()
  const backLink = `${applyPaths.applications.withdrawables.show({ id: placement.applicationId })}?selectedWithdrawableType=placement`

  const cancellationReasons = referenceDataFactory.buildList(4)

  const request: DeepMocked<Request> = createMock<Request>({ user: { token }, headers: { referer: backLink } })
  const response: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesId = 'premises-id'
  const placementId = 'placement-id'

  const cancellationService = createMock<CancellationService>({})
  const placementService = createMock<PlacementService>({})

  const cancellationsController = new CancellationsController(cancellationService, placementService)

  beforeEach(() => {
    jest.resetAllMocks()
    placementService.getPlacement.mockResolvedValue(placement)
    cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
  })

  describe('new', () => {
    it('should render the form with a placement (space_booking)', async () => {
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, placementId: placement.id } }, response, next)

      const { person, id } = placement
      const { arrivalDate, departureDate } = canonicalDates(placement)

      expect(response.render).toHaveBeenCalledWith('cancellations/new', {
        premisesId,
        booking: {
          arrivalDate,
          departureDate,
          person,
          id,
        },
        backLink,
        cancellationReasons,
        pageHeading: 'Confirm withdrawn placement',
        formAction: paths.premises.placements.cancellations.create({ premisesId, placementId: placement.id }),
        errors: {},
        errorSummary: [],
      })

      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placement.id)
      expect(cancellationService.getCancellationReasons).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>({})

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, placementId } }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'cancellations/new',
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        }),
      )
    })

    it('sets the backlink to the withdrawables show page if there is an applicationId on the placement', async () => {
      const placementWithoutAnApplication = cas1SpaceBookingFactory.build({ applicationId: undefined })
      ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
        return { errors: {}, errorSummary: [], userInput: {} }
      })

      placementService.getPlacement.mockResolvedValue(placementWithoutAnApplication)

      const requestHandler = cancellationsController.new()

      await requestHandler({ ...request, params: { premisesId, placementId }, headers: {} }, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'cancellations/new',
        expect.objectContaining({
          backLink: paths.premises.placements.show({ premisesId, placementId }),
        }),
      )
    })
  })

  describe('create', () => {
    beforeEach(() => {
      jest.resetAllMocks()
      placementService.getPlacement.mockResolvedValue(placement)
      cancellationService.getCancellationReasons.mockResolvedValue(cancellationReasons)
    })

    it("creates a Cancellation with today's date and redirects to the confirmation page", async () => {
      const { reasonId, reasonNotes } = cas1NewSpaceBookingCancellationFactory.build()
      const requestHandler = cancellationsController.create()

      request.params = {
        placementId: 'placementId',
        premisesId: 'premisesId',
      }

      request.body = {
        reason: reasonId,
        otherReason: reasonNotes,
      }

      await requestHandler(request, response, next)

      expect(placementService.createCancellation).toHaveBeenCalledWith(
        token,
        request.params.premisesId,
        request.params.placementId,
        {
          reasonId,
          reasonNotes,
          occurredAt: DateFormats.dateObjToIsoDate(new Date()),
        },
      )

      expect(response.render).toHaveBeenCalledWith('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
    })

    it('should catch the validation errors when the API returns an error creating a placement cancellation', async () => {
      const requestHandler = cancellationsController.create()
      const localResponse: DeepMocked<Response> = createMock<Response>({ locals: { user: [] } })
      const localRequest: DeepMocked<Request> = createMock<Request>({
        user: { token },
        headers: { referer: backLink },
        params: {
          placementId,
          premisesId,
        },
      })

      const err = new Error()

      placementService.createCancellation.mockImplementation(() => {
        throw err
      })

      await requestHandler(localRequest, localResponse, next)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        localRequest,
        localResponse,
        err,
        paths.premises.placements.cancellations.new({
          placementId,
          premisesId,
        }),
      )
    })
  })
})
