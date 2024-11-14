import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import type { NextFunction, Request, Response } from 'express'
import * as validationUtils from '../../../../utils/validation'
import { PlacementService, PremisesService } from '../../../../services'
import { referenceDataFactory, spaceBookingFactory } from '../../../../testutils/factories'
import DeparturesController from './departuresController'
import paths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import { BREACH_OR_RECALL_REASON_ID, PLANNED_MOVE_ON_REASON_ID } from '../../../../utils/placements'

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

  const TEST_DATE = new Date('2024-11-14T14:00:00.000Z')
  const departureFormData = {
    departureDate: '2024-10-08',
    'departureDate-day': '8',
    'departureDate-month': '10',
    'departureDate-year': '2024',
    departureTime: '9:35',
    reasonId: BREACH_OR_RECALL_REASON_ID,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(TEST_DATE)

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

    it('renders the form with data saved in session', async () => {
      placementService.getDepartureSessionData.mockReturnValue(departureFormData)

      const errorsAndUserInput = createMock<ErrorsAndUserInput>({
        errors: {},
        errorSummary: [],
        userInput: {},
      })
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
        ...departureFormData,
      })
    })
  })

  describe('saveNew', () => {
    const validBody = {
      ...departureFormData,
      reasonId: rootDepartureReason1.id,
    }

    it('returns errors for empty arrival date, time and reason', async () => {
      const requestHandler = departuresController.saveNew()

      request.body = {}

      await requestHandler(request, response, next)

      const expectedErrorData = {
        departureDate: 'You must enter a date of departure',
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

    it('returns errors for invalid date or time', async () => {
      const requestHandler = departuresController.saveNew()

      request.body = {
        'departureDate-day': '32',
        'departureDate-month': '13',
        'departureDate-year': '2024',
        departureTime: '9am',
        reasonId: rootDepartureReason1.id,
      }

      await requestHandler(request, response, next)

      const expectedErrorData = {
        departureDate: 'You must enter a valid date of departure',
        departureTime: 'You must enter a valid time of departure in 24-hour format',
      }

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('returns a date error for a date in the future', async () => {
      const requestHandler = departuresController.saveNew()

      request.body = {
        'departureDate-day': '15',
        'departureDate-month': '11',
        'departureDate-year': '2024',
        departureTime: '10:00',
        reasonId: rootDepartureReason1.id,
      }

      await requestHandler(request, response, next)

      const expectedErrorData = {
        departureDate: 'The date of departure must be today or in the past',
      }

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('returns a time error for a date today but time in the future', async () => {
      const requestHandler = departuresController.saveNew()

      request.body = {
        'departureDate-day': '14',
        'departureDate-month': '11',
        'departureDate-year': '2024',
        departureTime: '17:00',
        reasonId: rootDepartureReason1.id,
      }

      await requestHandler(request, response, next)

      const expectedErrorData = {
        departureTime: 'The time of departure must be in the past',
      }

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

        expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(
          placement.id,
          request.session,
          request.body,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
        )
      })
    })

    describe('if the selected reason is Breach or recall', () => {
      beforeEach(() => {
        request.body = { ...validBody, reasonId: rootDepartureReason2.id }
      })

      it('saves the datetime and selected reason to the session and redirects to the Breach or recall page', async () => {
        const requestHandler = departuresController.saveNew()

        await requestHandler(request, response, next)

        expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(
          placement.id,
          request.session,
          request.body,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.breachOrRecallReason({ premisesId, placementId: placement.id }),
        )
      })
    })

    describe('if the selected reason is Planned move-on', () => {
      beforeEach(() => {
        request.body = { ...validBody, reasonId: rootDepartureReason3.id }
      })

      it('saves the datetime and selected reason to the session and redirects to the Move on category page', async () => {
        const requestHandler = departuresController.saveNew()

        await requestHandler(request, response, next)

        expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(
          placement.id,
          request.session,
          request.body,
        )
        expect(response.redirect).toHaveBeenCalledWith(
          paths.premises.placements.departure.moveOnCategory({ premisesId, placementId: placement.id }),
        )
      })
    })
  })

  describe('breachOrRecallReason', () => {
    it('renders the Breach or recall reason form with placement information, list of breach or recall departure reasons, errors and user input', async () => {
      placementService.getDepartureSessionData.mockReturnValue(departureFormData)
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
        ...departureFormData,
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
          ...departureFormData,
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
        breachOrRecallReasonId: 'You must select a breach or recall reason',
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
        breachOrRecallReasonId: childDepartureReason1.id,
      }

      const requestHandler = departuresController.saveBreachOrRecallReason()

      await requestHandler(request, response, next)

      expect(placementService.setDepartureSessionData).toHaveBeenCalledWith(placement.id, request.session, {
        breachOrRecallReasonId: childDepartureReason1.id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('moveOnCategory', () => {
    it('renders the Move on category form with placement information, list of move on categories, errors and user input', async () => {
      placementService.getDepartureSessionData.mockReturnValue({
        ...departureFormData,
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
        ...departureFormData,
        reasonId: PLANNED_MOVE_ON_REASON_ID,
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
          ...departureFormData,
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
    it('renders the departure notes form with errors, user input and a backlink to the new departure page', async () => {
      placementService.getDepartureSessionData.mockReturnValue({
        ...departureFormData,
        reasonId: rootDepartureReason1.id,
      })
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = departuresController.notes()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/notes', {
        backlink: paths.premises.placements.departure.new({ premisesId, placementId: placement.id }),
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...departureFormData,
        reasonId: rootDepartureReason1.id,
        ...errorsAndUserInput.userInput,
      })
    })

    describe('if the reason selected was Breach or recall', () => {
      it('points the back link to the Breach or recall page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({
          ...departureFormData,
          reasonId: BREACH_OR_RECALL_REASON_ID,
        })

        const requestHandler = departuresController.notes()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/placements/departure/notes',
          expect.objectContaining({
            backlink: paths.premises.placements.departure.breachOrRecallReason({
              premisesId,
              placementId: placement.id,
            }),
          }),
        )
      })
    })

    describe('if the reason selected was Planned move on', () => {
      it('points the back link to the Move on category page', async () => {
        placementService.getDepartureSessionData.mockReturnValue({
          ...departureFormData,
          reasonId: PLANNED_MOVE_ON_REASON_ID,
        })

        const requestHandler = departuresController.notes()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/premises/placements/departure/notes',
          expect.objectContaining({
            backlink: paths.premises.placements.departure.moveOnCategory({
              premisesId,
              placementId: placement.id,
            }),
          }),
        )
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
      placementService.getDepartureSessionData.mockReturnValue({
        ...departureFormData,
        reasonId: rootDepartureReason1.id,
      })

      request.body = {
        notes: 'Some notes',
      }
      const requestHandler = departuresController.create()

      await requestHandler(request, response, next)

      expect(placementService.createDeparture).toHaveBeenCalledWith(token, premisesId, placement.id, {
        departureDateTime: '2024-10-08T09:35:00.000Z',
        reasonId: rootDepartureReason1.id,
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
