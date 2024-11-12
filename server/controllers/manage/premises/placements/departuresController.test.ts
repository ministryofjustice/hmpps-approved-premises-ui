import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import type { NextFunction, Request, Response } from 'express'
import * as validationUtils from '../../../../utils/validation'
import { PlacementService, PremisesService } from '../../../../services'
import { referenceDataFactory, spaceBookingFactory } from '../../../../testutils/factories'
import DeparturesController from './departuresController'

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
  const rootDepartureReason2 = referenceDataFactory.build({ parent: null })
  const childDepartureReason1 = referenceDataFactory.build({ parent: rootDepartureReason2.id })
  const childDepartureReason2 = referenceDataFactory.build({ parent: rootDepartureReason2.id })

  beforeEach(() => {
    jest.clearAllMocks()

    premisesService.getPlacement.mockResolvedValue(placement)
    placementService.getDepartureReasons.mockResolvedValue([
      rootDepartureReason1,
      rootDepartureReason2,
      childDepartureReason1,
      childDepartureReason2,
    ])
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
        departureReasons: [rootDepartureReason1, rootDepartureReason2],
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
