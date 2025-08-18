import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput, ErrorSummary } from '@approved-premises/ui'
import { when } from 'jest-when'
import KeyworkerController from './keyworkerController'
import {
  cas1CurrentKeyworkerFactory,
  cas1KeyworkerAllocationFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
  userSummaryFactory,
} from '../../../../testutils/factories'
import { PremisesService, UserService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import paths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'
import { ValidationError } from '../../../../utils/errors'
import {
  placementKeyDetails,
  renderKeyworkersSelectOptions,
  renderKeyworkersRadioOptions,
} from '../../../../utils/placements'
import { generateErrorMessages, generateErrorSummary } from '../../../../utils/validation'
import { keyworkersTableHead, keyworkersTableRows } from '../../../../utils/placements/keyworkers'
import { pagination } from '../../../../utils/pagination'

describe('keyworkerController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const userService = createMock<UserService>()

  const keyworkerController = new KeyworkerController(premisesService, placementService, userService)

  const premisesId = 'premises-id'
  const placement = cas1SpaceBookingFactory.build({ keyWorkerAllocation: undefined })
  const testStaffCode = 'TestId'
  const uiPlacementPagePath = paths.premises.placements.show({ premisesId, placementId: placement.id })
  const assignKeyworkerPath = paths.premises.placements.keyworker.new({ premisesId, placementId: placement.id })
  const uiKeyworkerPagePath = paths.premises.placements.keyworkerDeprecated({ premisesId, placementId: placement.id })
  const currentKeyworkers = cas1CurrentKeyworkerFactory.buildList(5)
  const keyworkers = staffMemberFactory.buildList(5, { keyWorker: true })
  const errorsAndUserInput = createMock<ErrorsAndUserInput>()

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    premisesService.getCurrentKeyworkers.mockResolvedValue(currentKeyworkers)
    premisesService.getKeyworkers.mockResolvedValue(keyworkers)

    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue()
  })

  describe('new', () => {
    const defaultRenderParams = {
      placement,
      backlink: paths.premises.placements.show({ premisesId, placementId: placement.id }),
      currentKeyworkerName: 'Not assigned',
      keyworkersOptions: renderKeyworkersRadioOptions(currentKeyworkers, placement),
      errors: errorsAndUserInput.errors,
      errorSummary: errorsAndUserInput.errorSummary,
      ...errorsAndUserInput.userInput,
    }

    it('should render the keyworker assignment form with a list of users currently assigned as keyworkers', async () => {
      await keyworkerController.new()(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(premisesService.getCurrentKeyworkers).toHaveBeenCalledWith(token, premisesId)
      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/assignKeyworker/new',
        defaultRenderParams,
      )
    })

    it('should render the name of the currently assigned keyworker and exclude them from the list', async () => {
      const assignedKeyworker = userSummaryFactory.build()
      const placementWithKeyworker = cas1SpaceBookingFactory.withAssignedKeyworker(assignedKeyworker).build()
      when(premisesService.getPlacement)
        .calledWith({ token, premisesId, placementId: placementWithKeyworker.id })
        .mockResolvedValue(placementWithKeyworker)
      request.params.placementId = placementWithKeyworker.id

      await keyworkerController.new()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/assignKeyworker/new', {
        ...defaultRenderParams,
        placement: placementWithKeyworker,
        backlink: paths.premises.placements.show({ premisesId, placementId: placementWithKeyworker.id }),
        currentKeyworkerName: assignedKeyworker.name,
      })
    })
  })

  describe('find', () => {
    const defaultRenderParams = {
      placement,
      backlink: assignKeyworkerPath,
      submitUrl: assignKeyworkerPath,
      tableHead: keyworkersTableHead,
      errors: {},
      errorSummary: [] as ErrorSummary,
    }

    it('shows a form to search for a keyworker but does not render a list of results', async () => {
      await keyworkerController.find()(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/assignKeyworker/find',
        defaultRenderParams,
      )
    })

    it('shows an error if a search has been made with a blank query', async () => {
      request.query = {
        nameOrEmail: '',
      }

      const expectedErrors = {
        nameOrEmail: 'Enter a name or email',
      }

      await keyworkerController.find()(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/assignKeyworker/find', {
        ...defaultRenderParams,
        nameOrEmail: '',
        errors: generateErrorMessages(expectedErrors),
        errorSummary: generateErrorSummary(expectedErrors),
      })
    })

    it('fetches and shows results if a valid search query has been entered', async () => {
      const availableKeyworkers = userSummaryFactory.buildList(6)

      userService.getUsersSummaries.mockResolvedValue({
        data: availableKeyworkers,
        pageSize: '10',
        pageNumber: '2',
        totalPages: '2',
        totalResults: '13',
      })

      request.query = {
        nameOrEmail: 'Smith',
        page: '2',
      }

      await keyworkerController.find()(request, response, next)

      expect(userService.getUsersSummaries).toHaveBeenCalledWith(token, {
        nameOrEmail: 'Smith',
        page: 2,
        permission: 'cas1_keyworker_assignable_as',
      })
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/assignKeyworker/find', {
        ...defaultRenderParams,
        nameOrEmail: 'Smith',
        tableRows: keyworkersTableRows(availableKeyworkers),
        pagination: pagination(
          2,
          2,
          `${paths.premises.placements.keyworker.find({
            premisesId,
            placementId: placement.id,
          })}?nameOrEmail=Smith&`,
        ),
      })
    })
  })

  describe('create', () => {
    it("redirects to the Find a keyworker page if 'Assign a different keyworker' is selected", async () => {
      request.body = { keyworker: 'new' }

      await keyworkerController.create()(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.premises.placements.keyworker.find({
          premisesId,
          placementId: placement.id,
        }),
      )
      expect(placementService.assignKeyworker).not.toHaveBeenCalled()
    })

    it('assigns the keyworker and returns to the placement details page', async () => {
      const selectedKeyworkerUser = currentKeyworkers[0].summary
      premisesService.getPlacement.mockResolvedValue({
        ...placement,
        keyWorkerAllocation: cas1KeyworkerAllocationFactory.build({
          keyWorkerUser: selectedKeyworkerUser,
        }),
      })

      request.body = { keyworker: selectedKeyworkerUser.id }

      await keyworkerController.create()(request, response, next)

      expect(placementService.assignKeyworker).toHaveBeenCalledWith(token, premisesId, placement.id, {
        userId: selectedKeyworkerUser.id,
      })
      expect(request.flash).toHaveBeenCalledWith('success', {
        heading: 'Keyworker assigned',
        body: `You have assigned ${selectedKeyworkerUser.name} to ${placement.person.crn}`,
      })
      expect(response.redirect).toHaveBeenCalledWith(uiPlacementPagePath)
    })

    it('returns an error if the page is submitted without a keyworker selected', async () => {
      request.body = {}

      await keyworkerController.create()(request, response, next)

      expect(placementService.assignKeyworker).not.toHaveBeenCalled()
      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        assignKeyworkerPath,
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({
        keyworker: 'Select a keyworker',
      })
    })

    describe('when errors are raised by the API', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        request.body = { keyworker: 'does-not-exist' }

        const err = new Error()

        placementService.assignKeyworker.mockRejectedValueOnce(err)

        await keyworkerController.create()(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          assignKeyworkerPath,
        )
      })
    })
  })

  // TODO: Remove deprecated handler tests when new flow released (APS-2644)
  describe('deprecated flow handlers', () => {
    describe('newDeprecated', () => {
      it('should render the keyworker assignement form with a list of staff', async () => {
        const requestHandler = keyworkerController.newDeprecated()

        await requestHandler(request, response, next)

        expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
        expect(premisesService.getKeyworkers).toHaveBeenCalledWith(token, premisesId)
        expect(response.render).toHaveBeenCalledWith('manage/premises/placements/keyworker', {
          placement,
          contextKeyDetails: placementKeyDetails(placement),
          keyworkersOptions: renderKeyworkersSelectOptions(keyworkers, placement),
          currentKeyworkerName: 'Not assigned',
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...errorsAndUserInput.userInput,
        })
      })
    })

    describe('assignDeprecated', () => {
      it('assigns the keyworker and returns to the placement details page', async () => {
        const requestHandler = keyworkerController.assignDeprecated()
        request.body = { staffCode: testStaffCode }

        await requestHandler(request, response, next)

        expect(placementService.assignKeyworker).toHaveBeenCalledWith(token, premisesId, placement.id, {
          staffCode: testStaffCode,
        })
        expect(request.flash).toHaveBeenCalledWith('success', 'Keyworker assigned')
        expect(response.redirect).toHaveBeenCalledWith(uiPlacementPagePath)
      })

      it('returns error if page submitted without keyworker selected', async () => {
        const requestHandler = keyworkerController.assignDeprecated()

        request.body = {}

        await requestHandler(request, response, next)

        expect(placementService.assignKeyworker).not.toHaveBeenCalled()
        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          new ValidationError({}),
          uiKeyworkerPagePath,
        )

        const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

        expect(errorData).toEqual({
          staffCode: 'You must select a keyworker',
        })
      })

      describe('when errors are raised by the API', () => {
        it('should call catchValidationErrorOrPropogate with a standard error', async () => {
          const requestHandler = keyworkerController.assignDeprecated()
          request.body = { staffCode: testStaffCode }

          const err = new Error()

          placementService.assignKeyworker.mockRejectedValue(err)

          await requestHandler(request, response, next)

          expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
            request,
            response,
            err,
            uiKeyworkerPagePath,
          )
        })
      })
    })
  })
})
