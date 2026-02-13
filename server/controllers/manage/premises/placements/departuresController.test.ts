import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import type { NextFunction, Request, Response } from 'express'
import { addDays } from 'date-fns'
import * as validationUtils from '../../../../utils/validation'
import { PlacementService, PremisesService } from '../../../../services'
import {
  cas1PremisesBasicSummaryFactory,
  cas1SpaceBookingFactory,
  departureReasonFactory,
  referenceDataFactory,
  userFactory,
} from '../../../../testutils/factories'
import DeparturesController from './departuresController'
import paths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import {
  BED_WITHDRAWN_REASON_ID,
  BREACH_OR_RECALL_REASON_ID,
  LICENCE_EXPIRED_REASON_ID,
  MOVE_TO_AP_REASON_ID,
  placementKeyDetails,
  PLANNED_MOVE_ON_REASON_ID,
} from '../../../../utils/placements'
import { timeAddLeadingZero } from '../../../../utils/dateUtils'
import * as residentUtils from '../../../../utils/resident'

describe('DeparturesController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const departuresController = new DeparturesController(premisesService, placementService)

  const errorsAndUserInput = createMock<ErrorsAndUserInput>({
    errors: {},
    errorSummary: [],
    errorTitle: '',
    userInput: {},
  })

  const premisesId = 'premises-id'
  const TEST_DATE = new Date('2024-11-14T14:00:00.000Z')
  const placement = cas1SpaceBookingFactory.current().build({
    actualArrivalDate: '2024-11-09',
    actualArrivalTime: '11:30',
  })
  const departureFormData = {
    departureDate: '2024-11-13',
    'departureDate-day': '13',
    'departureDate-month': '11',
    'departureDate-year': '2024',
    departureTime: '9:35',
    reasonId: BREACH_OR_RECALL_REASON_ID,
  }

  const rootDepartureReason1 = departureReasonFactory.build({ parentReasonId: null })
  const rootDepartureReason2 = departureReasonFactory.build({ id: BREACH_OR_RECALL_REASON_ID, parentReasonId: null })
  const rootDepartureReason3 = departureReasonFactory.build({ id: PLANNED_MOVE_ON_REASON_ID, parentReasonId: null })
  const childDepartureReason1 = departureReasonFactory.build({ parentReasonId: BREACH_OR_RECALL_REASON_ID })
  const childDepartureReason2 = departureReasonFactory.build({ parentReasonId: BREACH_OR_RECALL_REASON_ID })
  const departureReasons = [
    rootDepartureReason1,
    rootDepartureReason2,
    rootDepartureReason3,
    childDepartureReason1,
    childDepartureReason2,
  ]

  const moveOnCategories = referenceDataFactory.buildList(5)
  const premisesList = cas1PremisesBasicSummaryFactory.buildList(10)

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(TEST_DATE)

    premisesService.getPlacement.mockResolvedValue(placement)
    placementService.getDepartureReasons.mockResolvedValue(departureReasons)
    placementService.getMoveOnCategories.mockResolvedValue(moveOnCategories)
    premisesService.getCas1All.mockResolvedValue(premisesList)

    request = createMock<Request>({
      user: { token },
      params: { premisesId, placementId: placement.id },
      session: {
        save: jest.fn().mockImplementation((callback: () => unknown) => callback()),
        multiPageFormData: { departures: { [placement.id]: departureFormData } },
        user: userFactory.build({ permissions: [] }),
      },
    })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
    jest.spyOn(departuresController.formData, 'update')
    jest.spyOn(departuresController.formData, 'remove')

    jest.spyOn(residentUtils, 'returnPath').mockReturnValue('return path')
  })

  describe('new', () => {
    it('renders the form with placement information, list of root departure reasons as radios, errors and user input', async () => {
      request.session.multiPageFormData = undefined

      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      await departuresController.new()(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/new', {
        backlink: 'return path',
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        departureReasons: [rootDepartureReason1, rootDepartureReason2, rootDepartureReason3],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })

    it('renders the form with data saved in session', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      await departuresController.new()(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/new', {
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        backlink: 'return path',
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
      request.body = {}

      await departuresController.saveNew()(request, response, next)

      const expectedErrorData = {
        departureDate: 'You must enter a date of departure',
        departureTime: 'You must enter a time of departure',
        reasonId: 'You must select a reason',
      }

      expect(departuresController.formData.update).not.toHaveBeenCalled()
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
      request.body = {
        'departureDate-day': '32',
        'departureDate-month': '13',
        'departureDate-year': '2024',
        departureTime: '9am',
        reasonId: rootDepartureReason1.id,
      }

      await departuresController.saveNew()(request, response, next)

      const expectedErrorData = {
        departureDate: 'You must enter a valid date of departure',
        departureTime: 'You must enter a valid time of departure in 24-hour format',
      }

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    describe('future date or time', () => {
      it('returns a date error for a date in the future', async () => {
        request.body = {
          'departureDate-day': '15',
          'departureDate-month': '11',
          'departureDate-year': '2024',
          departureTime: '10:00',
          reasonId: rootDepartureReason1.id,
        }

        await departuresController.saveNew()(request, response, next)

        const expectedErrorData = {
          departureDate: 'The date of departure must be today or in the past',
        }

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it('returns a time error for a date today but time in the future', async () => {
        request.body = {
          'departureDate-day': '14',
          'departureDate-month': '11',
          'departureDate-year': '2024',
          departureTime: '17:00',
          reasonId: rootDepartureReason1.id,
        }

        await departuresController.saveNew()(request, response, next)

        const expectedErrorData = {
          departureTime: 'The time of departure must be in the past',
        }

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })
    })

    describe('Date too long ago', () => {
      const placementEarlyArrival = cas1SpaceBookingFactory.current().build({
        actualArrivalDate: '2024-10-09',
        actualArrivalTime: '11:30',
      })

      beforeEach(() => {
        premisesService.getPlacement.mockResolvedValue(placementEarlyArrival)

        request.body = {
          'departureDate-day': '07',
          'departureDate-month': '11',
          'departureDate-year': '2024',
          departureTime: '11:00',
          reasonId: rootDepartureReason1.id,
        }
      })

      it('returns a date error if the date is more than 7 days ago', async () => {
        await departuresController.saveNew()(request, response, next)

        const expectedErrorData = {
          departureDate: 'The date of departure must not be more than 7 days ago',
        }

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it('does not return a date error if the user has the correct permission', async () => {
        request.session.user = userFactory.build({ permissions: ['cas1_space_booking_record_departure_no_date_limit'] })

        await departuresController.saveNew()(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).not.toHaveBeenCalled()
      })
    })

    describe('date or time before arrival date', () => {
      it('returns a date error for a date before the arrival date', async () => {
        request.body = {
          'departureDate-day': '01',
          'departureDate-month': '11',
          'departureDate-year': '2024',
          departureTime: '10:00',
          reasonId: rootDepartureReason1.id,
        }

        await departuresController.saveNew()(request, response, next)

        const expectedErrorData = {
          departureDate: 'The date of departure must be the same as or after 9 Nov 2024, when the person arrived',
        }

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })

      it('returns a time error for a date on the same day but before the arrival time', async () => {
        request.body = {
          'departureDate-day': '9',
          'departureDate-month': '11',
          'departureDate-year': '2024',
          departureTime: '11:00',
          reasonId: rootDepartureReason1.id,
        }

        await departuresController.saveNew()(request, response, next)

        const expectedErrorData = {
          departureTime: 'The time of departure must be after the time of arrival, 11:30 on 9 Nov 2024',
        }

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual(expectedErrorData)
      })
    })

    it('saves datetime and selected reason and redirects to the notes page if the selected reason is not Breach or recall or Planned move-on', async () => {
      request.body = validBody
      await departuresController.saveNew()(request, response, next)

      expect(departuresController.formData.update).toHaveBeenCalledWith(placement.id, request.session, request.body)
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })

    it('saves datetime and selected reason to session and redirects to the Breach or recall page if the selected reason is Breach or recall', async () => {
      request.body = { ...validBody, reasonId: rootDepartureReason2.id }

      await departuresController.saveNew()(request, response, next)

      expect(departuresController.formData.update).toHaveBeenCalledWith(placement.id, request.session, request.body)
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.breachOrRecallReason({ premisesId, placementId: placement.id }),
      )
    })

    it('saves datetime and selected reason to session and redirects to Move on category page if the selected reason is Planned move-on', async () => {
      request.body = { ...validBody, reasonId: rootDepartureReason3.id }

      await departuresController.saveNew()(request, response, next)

      expect(departuresController.formData.update).toHaveBeenCalledWith(placement.id, request.session, request.body)
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.moveOnCategory({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('breachOrRecallReason', () => {
    it('renders the Breach or recall reason form with placement information, list of breach or recall departure reasons, errors and user input', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      await departuresController.breachOrRecallReason()(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/breach-or-recall', {
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        backlink: paths.premises.placements.departure.new({ premisesId, placementId: placement.id }),
        departureReasons: [childDepartureReason1, childDepartureReason2],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...departureFormData,
        ...errorsAndUserInput.userInput,
      })
    })

    it('if there is no departure data in the session it redirects to the placement view', async () => {
      request.session.multiPageFormData = undefined

      await departuresController.breachOrRecallReason()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })

    it('if the selected main reason is not breach or recall  it redirects to the placement view', async () => {
      request.session.multiPageFormData.departures[placement.id].reasonId = 'not-breach-or-recall-id'

      await departuresController.breachOrRecallReason()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })
  })

  describe('saveBreachOrRecallReason', () => {
    it('returns errors if the breach or recall reason is not selected', async () => {
      request.body = {}

      await departuresController.saveBreachOrRecallReason()(request, response, next)

      const expectedErrorData = {
        breachOrRecallReasonId: 'You must select a breach or recall reason',
      }

      expect(departuresController.formData.update).not.toHaveBeenCalled()
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

      await departuresController.saveBreachOrRecallReason()(request, response, next)

      expect(departuresController.formData.update).toHaveBeenCalledWith(placement.id, request.session, {
        breachOrRecallReasonId: childDepartureReason1.id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('moveOnCategory', () => {
    it.each([
      ['Planned move-on reason', PLANNED_MOVE_ON_REASON_ID],
      ['Licence expired reason', LICENCE_EXPIRED_REASON_ID],
      ['Bed withdrawn reason', BED_WITHDRAWN_REASON_ID],
    ])(
      'renders the Move on category form with placement information, list of move on categories, errors and user input for reason: %s',
      async (_, reasonId) => {
        request.session.multiPageFormData.departures[placement.id].reasonId = reasonId

        when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

        await departuresController.moveOnCategory()(request, response, next)

        expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
        expect(premisesService.getCas1All).toHaveBeenCalledWith(token)
        expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/move-on-category', {
          contextKeyDetails: placementKeyDetails(placement),
          placement,
          backlink: paths.premises.placements.departure.new({ premisesId, placementId: placement.id }),
          moveOnCategories,
          MOVE_TO_AP_REASON_ID,
          premisesSummaries: premisesList,
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...departureFormData,
          reasonId,
          ...errorsAndUserInput.userInput,
        })

        expect(response.redirect).not.toHaveBeenCalled()
      },
    )

    it('if there is no departure data in the session it redirects to the placement view', async () => {
      request.session.multiPageFormData = undefined

      await departuresController.moveOnCategory()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })

    it('if the selected main reason is not Planned move-on, it redirects to the placement view', async () => {
      request.session.multiPageFormData.departures[placement.id].reasonId = 'not-planned-move-on-id'

      await departuresController.moveOnCategory()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })
  })

  describe('saveMoveOnCategory', () => {
    it('returns errors if the planned move on category is not selected', async () => {
      request.body = {}

      await departuresController.saveMoveOnCategory()(request, response, next)

      const expectedErrorData = {
        moveOnCategoryId: 'You must select a move on category',
      }

      expect(departuresController.formData.update).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.premises.placements.departure.moveOnCategory({ premisesId, placementId: placement.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual(expectedErrorData)
    })

    it('returns errors if the move-on category is Transfer to AP, but the AP is not selected', async () => {
      request.body = { moveOnCategoryId: MOVE_TO_AP_REASON_ID }

      await departuresController.saveMoveOnCategory()(request, response, next)

      expect(departuresController.formData.update).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.premises.placements.departure.moveOnCategory({ premisesId, placementId: placement.id }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        apName: 'You must select the destination AP',
      })
    })

    it('saves the breach or recall reason and redirects to the notes page', async () => {
      request.body = {
        moveOnCategoryId: moveOnCategories[1].id,
      }

      await departuresController.saveMoveOnCategory()(request, response, next)

      expect(departuresController.formData.update).toHaveBeenCalledWith(placement.id, request.session, {
        moveOnCategoryId: moveOnCategories[1].id,
      })
      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })
  })

  describe('notes', () => {
    it('renders the departure notes form with errors, user input and a backlink to the new departure page', async () => {
      request.session.multiPageFormData.departures[placement.id].reasonId = rootDepartureReason1.id

      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      await departuresController.notes()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/departure/notes', {
        backlink: paths.premises.placements.departure.new({ premisesId, placementId: placement.id }),
        contextKeyDetails: placementKeyDetails(placement),
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...departureFormData,
        reasonId: rootDepartureReason1.id,
        ...errorsAndUserInput.userInput,
      })
    })

    it('points the back link to the Breach or recall page if the reason selected was Breach or recall', async () => {
      request.session.multiPageFormData.departures[placement.id].reasonId = BREACH_OR_RECALL_REASON_ID

      await departuresController.notes()(request, response, next)

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

    it('points the back link to the Move on category page if the reason selected was Planned move on', async () => {
      request.session.multiPageFormData.departures[placement.id].reasonId = PLANNED_MOVE_ON_REASON_ID

      await departuresController.notes()(request, response, next)

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

    it('redirects to the placement view if there is no departure data in the session', async () => {
      request.session.multiPageFormData = undefined

      await departuresController.notes()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })
  })

  describe('create', () => {
    it.each([
      ['2024-10-08', '9:35'],
      ['2025-03-31', '11:15'],
    ])(
      'creates the departure on %s at %s, clears the session and redirects to the placement page',
      async (date, time) => {
        jest.setSystemTime(addDays(new Date(date), 1))
        const [year, month, day] = date.split('-').map(part => part.replace(/^0+/g, ''))
        request.session.multiPageFormData.departures[placement.id] = {
          ...departureFormData,
          'departureDate-day': day,
          'departureDate-month': month,
          'departureDate-year': year,
          departureDate: date,
          departureTime: time,
          reasonId: rootDepartureReason1.id,
        }

        request.body = {
          notes: 'Some notes',
        }

        await departuresController.create()(request, response, next)

        expect(placementService.createDeparture).toHaveBeenCalledWith(token, premisesId, placement.id, {
          departureDate: date,
          departureTime: timeAddLeadingZero(time),
          reasonId: rootDepartureReason1.id,
          notes: 'Some notes',
        })
        expect(departuresController.formData.remove).toHaveBeenCalledWith(placement.id, request.session)
        expect(request.flash).toHaveBeenCalledWith('success', 'You have recorded this person as departed')
        expect(response.redirect).toHaveBeenCalledWith('return path')
      },
    )

    it('should call catchValidationErrorOrPropogate with a standard error when errors are raised by the API', async () => {
      const err = new Error()

      placementService.createDeparture.mockRejectedValue(err)

      await departuresController.create()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.premises.placements.departure.notes({ premisesId, placementId: placement.id }),
      )
    })

    it('redirects to the placement view if there is no departure data in the session', async () => {
      request.session.multiPageFormData = undefined

      await departuresController.create()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith('return path')
    })
  })
})
