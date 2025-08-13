import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import KeyworkerController from './keyworkerController'
import {
  cas1CurrentKeyworkerFactory,
  cas1KeyworkerAllocationFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
  userSummaryFactory,
} from '../../../../testutils/factories'
import { PremisesService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import paths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'
import { ValidationError } from '../../../../utils/errors'
import {
  placementKeyDetails,
  renderKeyworkersSelectOptions,
  renderKeyworkersRadioOptions,
} from '../../../../utils/placements'

describe('keyworkerController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()

  const keyworkerController = new KeyworkerController(premisesService, placementService)

  const premisesId = 'premises-id'
  const placement = cas1SpaceBookingFactory.build({ keyWorkerAllocation: undefined })
  const testStaffCode = 'TestId'
  const uiPlacementPagePath = paths.premises.placements.show({ premisesId, placementId: placement.id })
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

  describe('create', () => {
    it('assigns the keyworker and returns to the placement details page', async () => {
      const selectedKeyworkerUser = currentKeyworkers[0].summary
      premisesService.getPlacement.mockResolvedValue({
        ...placement,
        keyWorkerAllocation: cas1KeyworkerAllocationFactory.build({ keyWorkerUser: selectedKeyworkerUser }),
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
        paths.premises.placements.keyworker({ premisesId, placementId: placement.id }),
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
          paths.premises.placements.keyworker({ premisesId, placementId: placement.id }),
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
