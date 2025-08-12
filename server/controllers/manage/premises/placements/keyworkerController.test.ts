import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import KeyworkerController from './keyworkerController'
import { cas1SpaceBookingFactory, staffMemberFactory } from '../../../../testutils/factories'
import { PremisesService } from '../../../../services'
import * as validationUtils from '../../../../utils/validation'
import paths from '../../../../paths/manage'
import PlacementService from '../../../../services/placementService'
import { ValidationError } from '../../../../utils/errors'
import { placementKeyDetails, renderKeyworkersSelectOptions } from '../../../../utils/placements'

describe('keyworkerController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const premisesService = createMock<PremisesService>()
  const placementService = createMock<PlacementService>()
  const keyworkerController = new KeyworkerController(premisesService, placementService)

  const premisesId = 'premises-id'
  const placement = cas1SpaceBookingFactory.build()
  const testStaffCode = 'TestId'
  const uiPlacementPagePath = paths.premises.placements.show({ premisesId, placementId: placement.id })
  const uiKeyworkerPagePath = paths.premises.placements.keyworkerDeprecated({ premisesId, placementId: placement.id })
  const keyworkers = staffMemberFactory.buildList(5, { keyWorker: true })

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    premisesService.getKeyworkers.mockResolvedValue(keyworkers)

    request = createMock<Request>({ user: { token }, params: { premisesId, placementId: placement.id } })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('should render the keyworker assignement form with a list of staff', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = keyworkerController.newDeprecated()

      await requestHandler(request, response, next)

      expect(premisesService.getPlacement).toHaveBeenCalledWith({ token, premisesId, placementId: placement.id })
      expect(premisesService.getKeyworkers).toHaveBeenCalledWith(token, premisesId)
      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/keyworker', {
        placement,
        contextKeyDetails: placementKeyDetails(placement),
        keyworkersOptions: renderKeyworkersSelectOptions(keyworkers, placement),
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorker?.name,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('assign', () => {
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
