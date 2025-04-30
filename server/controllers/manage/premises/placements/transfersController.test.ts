import { createMock, DeepMocked } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { when } from 'jest-when'
import TransfersController from './transfersController'
import { cas1PremisesFactory, cas1SpaceBookingFactory } from '../../../../testutils/factories'
import { PlacementService } from '../../../../services'
import managePaths from '../../../../paths/manage'
import * as validationUtils from '../../../../utils/validation'
import { DateFormats } from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'

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
  const errorsAndUserInput = createMock<ErrorsAndUserInput>()

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

    it('renders the new transfer form with session data if it exists', async () => {
      const sessionData = {
        transferDate: '2025-04-30',
        'transferDate-year': '2025',
        'transferDate-month': '4',
        'transferDate-day': '30',
      }
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: sessionData,
        },
      }
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.new()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/premises/placements/transfers/new',
        expect.objectContaining(sessionData),
      )
    })
  })

  describe('saveNew', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(DateFormats.isoToDateObj('2025-04-29'))
    })

    it.each([
      ['empty', '', 'You must enter a transfer date'],
      ['incomplete', '2025-04', 'You must enter a valid transfer date'],
      ['invalid', '2025-02-37', 'You must enter a valid transfer date'],
      ['more than a week ago', '2025-04-21', 'The date of transfer must be today or in the last 7 days'],
      ['tomorrow', '2025-04-30', 'The date of transfer must be today or in the last 7 days'],
    ])('shows an error if the date is %s', async (_, date, errorMessage) => {
      const requestHandler = transfersController.saveNew()
      const [year, month, day] = date.split('-')
      request.body = {
        'transferDate-year': year,
        'transferDate-month': month,
        'transferDate-day': day,
      }

      await requestHandler(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        managePaths.premises.placements.transfers.new(params),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data

      expect(errorData).toEqual({ transferDate: errorMessage })
    })
  })

  describe('emergencyDetails', () => {
    const sessionData = {
      transferDate: '2025-04-30',
      'transferDate-year': '2025',
      'transferDate-month': '4',
      'transferDate-day': '30',
    }

    beforeEach(() => {
      request.session.multiPageFormData = {
        transfers: {
          [placement.id]: sessionData,
        },
      }
    })

    it('redirects to the new transfer page if there is no data in the session', async () => {
      request.session.multiPageFormData = undefined

      const requestHandler = transfersController.emergencyDetails()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(managePaths.premises.placements.transfers.new(params))
    })

    it('renders the form with errors and user input', async () => {
      when(validationUtils.fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = transfersController.emergencyDetails()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('manage/premises/placements/transfers/emergency-details', {
        backlink: managePaths.premises.placements.transfers.new(params),
        pageHeading: 'Enter the emergency transfer details',
        placement,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        ...sessionData,
        ...errorsAndUserInput.userInput,
      })
    })
  })
})
