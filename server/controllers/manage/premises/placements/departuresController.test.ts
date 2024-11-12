import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import type { NextFunction, Request, Response } from 'express'
import * as validationUtils from '../../../../utils/validation'
import { PlacementService, PremisesService } from '../../../../services'
import { referenceDataFactory, spaceBookingFactory } from '../../../../testutils/factories'
import DeparturesController, { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from './departuresController'
import paths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'

describe('DeparturesController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const departuresController = new DeparturesController(premisesService, placementService)

  const premisesId = 'premises-id'
  const placement = spaceBookingFactory.build()

  const rootDepartureReason1 = referenceDataFactory.build({ parent: null })
  const rootDepartureReason2 = referenceDataFactory.build({ id: BREACH_OR_RECALL_REASON_ID, parent: null })
  const rootDepartureReason3 = referenceDataFactory.build({ id: PLANNED_MOVE_ON_REASON_ID, parent: null })
  const childDepartureReason1 = referenceDataFactory.build({ parent: BREACH_OR_RECALL_REASON_ID })
  const childDepartureReason2 = referenceDataFactory.build({ parent: BREACH_OR_RECALL_REASON_ID })
  const departureReasons = [
    rootDepartureReason1,
    rootDepartureReason2,
    rootDepartureReason3,
    childDepartureReason1,
    childDepartureReason2,
  ]
  const moveOnCategories = referenceDataFactory.buildList(5)

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    placementService.getDepartureReasons.mockResolvedValue(departureReasons)
    placementService.getMoveOnCategories.mockResolvedValue(moveOnCategories)
    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the form with placement information, list of root departure reasons as radios, errors and user input', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.new()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/new', {
        placement,
        departureReasons: [rootDepartureReason1, rootDepartureReason2, rootDepartureReason3],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('saveNew', () => {
    const validBody = {
      'departureDateTime-year': '2024',
      'departureDateTime-month': '12',
      'departureDateTime-day': '8',
      departureTime: '9:35',
      reasonId: rootDepartureReason1.id,
    }

    it('returns errors for empty arrival date, time and reason', async () => {
      const requestHandler = departuresController.saveNew()

      request.body = {}

      await requestHandler(request, response, next)

      const expectedErrorData = {
        departureDateTime: 'You must enter an departure date',
        departureTime: 'You must enter a time of departure',
        reasonId: 'You must select a reason',
      }

      expect(placementService.setDepartureSessionData).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.premises.placements.departure.new({ premisesId, placementId: placement.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    describe('if the selected reason is not Breach or recall or Planned move-on', () => {
      beforeEach(() => {
        request.body = validBody
      })

      it('saves the datetime and selected reason to the session and redirects to the notes page', async () => {
        const requestHandler = departuresController.saveNew()

        await requestHandler(request, response, next)

        expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(placement.id, request.session, {
          departureDateTime: '2024-12-08T09:35:00.000Z',
          reasonId: rootDepartureReason1.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
        )
      })
    })

    describe('if the selected reason is Breach or recall', () => {
      beforeEach(() => {
        request.body = { ...validBody, reasonId: rootDepartureReason2.id }
      })

      it('saves the datetime and selected reason to the session and redirects to the second page', async () => {
        const requestHandler = departuresController.saveNew()

        await requestHandler(request, response, next)

        expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(placement.id, request.session, {
          departureDateTime: '2024-12-08T09:35:00.000Z',
          reasonId: rootDepartureReason2.id,
        })
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.breachOrRecallReason({ premisesId, placementId: placement.id }),
        )
      })
    })
  })

  describe('breachOrRecallReason', () => {
    it('renders the Breach or recall reason form with placement information, list of breach or recall departure reasons, errors and user input', async () => {
      placementService.getDepartureSessionData.mockReturnValue({
        departureDateTime: '2025-01-24T23:11:00.000Z',
        reasonId: BREACH_OR_RECALL_REASON_ID,
      })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.breachOrRecallReason()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/breach-or-recall', {
        placement,
        departureReasons: [childDepartureReason1, childDepartureReason2],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })

    describe('if there is no departure data in the session', () => {
      it('redirects to the new departure page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({})

        const requestHandler = departuresController.breachOrRecallReason()

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.new({
            premisesId,
            placementId: placement.id,
          }),
        )
      })
    })

    describe('if the selected main reason is not breach or recall', () => {
      it('redirects to the new departure page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({
          departureDateTime: '2025-01-24T23:11:00.000Z',
          reasonId: 'not-breach-or-recall-id',
        })

        const requestHandler = departuresController.breachOrRecallReason()

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.new({
            premisesId,
            placementId: placement.id,
          }),
        )
      })
    })
  })

  describe('saveBreachOrRecallReason', () => {
    it('returns errors if the breach or recall reason is not selected', async () => {
      const requestHandler = departuresController.saveBreachOrRecallReason()

      request.body = {}

      await requestHandler(request, response, next)

      const expectedErrorData = {
        reasonId: 'You must select a reason',
      }

      expect(placementService.setDepartureSessionData).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.premises.placements.departure.breachOrRecallReason({ premisesId, placementId: placement.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('saves the breach or recall reason and redirects to the notes page', async () => {
      request.body = {
        reasonId: childDepartureReason1.id,
      }

      const requestHandler = departuresController.saveBreachOrRecallReason()

      await requestHandler(request, response, next)

      expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(placement.id, request.session, {
        reasonId: childDepartureReason1.id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('moveOnCategory', () => {
    it('renders the Move on category form with placement information, list of move on categories, errors and user input', async () => {
      placementService.getDepartureSessionData.mockReturnValue({
        departureDateTime: '2025-01-24T23:11:00.000Z',
        reasonId: PLANNED_MOVE_ON_REASON_ID,
      })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.moveOnCategory()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/move-on-category', {
        placement,
        moveOnCategories,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })

    describe('if there is no departure data in the session', () => {
      it('redirects to the new departure page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({})

        const requestHandler = departuresController.moveOnCategory()

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.new({
            premisesId,
            placementId: placement.id,
          }),
        )
      })
    })

    describe('if the selected main reason is not Planned move-on', () => {
      it('redirects to the new departure page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({
          departureDateTime: '2025-01-24T23:11:00.000Z',
          reasonId: 'not-planned-move-on-id',
        })

        const requestHandler = departuresController.moveOnCategory()

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.new({
            premisesId,
            placementId: placement.id,
          }),
        )
      })
    })
  })

  describe('saveMoveOnCategory', () => {
    it('returns errors if the planned move on category is not selected', async () => {
      const requestHandler = departuresController.saveMoveOnCategory()

      request.body = {}

      await requestHandler(request, response, next)

      const expectedErrorData = {
        moveOnCategoryId: 'You must select a move on category',
      }

      expect(placementService.setDepartureSessionData).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.premises.placements.departure.moveOnCategory({ premisesId, placementId: placement.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('saves the breach or recall reason and redirects to the notes page', async () => {
      request.body = {
        moveOnCategoryId: moveOnCategories[1].id,
      }

      const requestHandler = departuresController.saveMoveOnCategory()

      await requestHandler(request, response, next)

      expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(placement.id, request.session, {
        moveOnCategoryId: moveOnCategories[1].id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('notes', () => {
    it('renders the departure notes form with  errors and user input', async () => {
      placementService.getDepartureSessionData.mockReturnValue({
        departureDateTime: '2025-01-24T23:11:00.000Z',
        reasonId: BREACH_OR_RECALL_REASON_ID,
      })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.notes()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/notes', {
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })

    describe('if there is no departure data in the session', () => {
      it('redirects to the new departure page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({})

        const requestHandler = departuresController.notes()

        await requestHandler(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.new({
            premisesId,
            placementId: placement.id,
          }),
        )
      })
    })
  })

  describe('create', () => {
    it('creates the departure and redirects to the placement page', async () => {
      const departureSessionData = {
        departureDateTime: '2024-10-09T16:13:00.000Z',
        reasonId: rootDepartureReason1.id,
      }
      placementService.getDepartureSessionData.mockReturnValue(departureSessionData)
      request.body = {
        notes: 'Some notes',
      }
      const requestHandler = departuresController.create()

      await requestHandler(request, response, next)

      expect(placementService.createDeparture).toHaveBeenCalledWith(token, premisesId, placement.id, {
        ...departureSessionData,
        notes: 'Some notes',
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as departed')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.show({ premisesId, placementId: placement.id }),
      )
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestHandler = departuresController.create()

        const err = new Error()

        placementService.createDeparture.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
        )
      })
    })
  })
})
