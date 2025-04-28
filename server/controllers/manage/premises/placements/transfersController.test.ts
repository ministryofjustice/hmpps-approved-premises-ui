import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import TransfersController from './transfersController'
import { cas1PremisesFactory, cas1SpaceBookingFactory } from '../../../../testutils/factories'
import { PlacementService } from '../../../../services'
import managePaths from '../../../../paths/manage'
import * as validationUtils from '../../../../utils/validation'

describe('transfersController', () => {
  const token = 'TEST_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>()
  const next: DeepMocked<NextFunction> = createMock<NextFunction>()

  const placementService = createMock<PlacementService>()
  const transfersController = new TransfersController(placementService)

  const premises = cas1PremisesFactory.build()
  const placement = cas1SpaceBookingFactory.current().build()

  const params = { premisesId: premises.id, placementId: placement.id }

  beforeEach(() => {
    jest.clearAllMocks()

    placementService.getPlacement.mockResolvedValue(placement)
    request = createMock<Request>({
      user: { token },
      params,
    })

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput')
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the new transfer form with errors and user input', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show(params),
        pageHeading: 'Request a transfer',
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
