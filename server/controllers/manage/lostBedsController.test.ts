import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { SanitisedError } from '../../sanitisedError'
import LostBedService, { LostBedReferenceData } from '../../services/lostBedService'
import LostBedsController from './lostBedsController'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'
import { lostBedFactory } from '../../testutils/factories'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')
jest.mock('../../utils/bookingUtils')

describe('LostBedsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const lostBedService = createMock<LostBedService>({})

  const lostBedController = new LostBedsController(lostBedService)
  const premisesId = 'premisesId'
  const bedId = 'bedId'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('new', () => {
    it('renders the form', async () => {
      const lostBedReasons = createMock<LostBedReferenceData>()
      lostBedService.getReferenceData.mockResolvedValue(lostBedReasons)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      const requestHandler = lostBedController.new()

      request.params = {
        premisesId,
        bedId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('lostBeds/new', {
        premisesId,
        bedId,
        lostBedReasons,
        errors: {},
        errorSummary: [],
        errorTitle: undefined,
      })
      expect(lostBedService.getReferenceData).toHaveBeenCalledWith(token)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const lostBedReasons = createMock<LostBedReferenceData>()
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      lostBedService.getReferenceData.mockResolvedValue(lostBedReasons)
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const requestHandler = lostBedController.new()

      request.params = {
        premisesId,
        bedId,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('lostBeds/new', {
        premisesId: request.params.premisesId,
        bedId: request.params.bedId,
        lostBedReasons,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
        ...errorsAndUserInput.userInput,
      })
    })
  })

  describe('create', () => {
    it('creates a lost bed and redirects to the premises page', async () => {
      const lostBed = lostBedFactory.build()
      lostBedService.createLostBed.mockResolvedValue(lostBed)

      const requestHandler = lostBedController.create()

      request.params = {
        premisesId,
        bedId: lostBed.bedId,
      }

      request.body = {
        'startDate-year': 2022,
        'startDate-month': 8,
        'startDate-day': 22,
        'endDate-year': 2022,
        'endDate-month': 9,
        'endDate-day': 22,
        lostBed,
      }

      await requestHandler(request, response, next)

      expect(lostBedService.createLostBed).toHaveBeenCalledWith(token, request.params.premisesId, {
        ...lostBed,
        bedId: request.params.bedId,
        startDate: '2022-08-22',
        endDate: '2022-09-22',
        serviceName: 'approved-premises',
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'Lost bed logged')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: request.params.premisesId }))
    })

    describe('when errors are raised', () => {
      request.params = {
        premisesId,
        bedId,
      }

      const requestHandler = lostBedController.create()

      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error()

        lostBedService.createLostBed.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.lostBeds.new({ premisesId, bedId }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        const err = createMock<SanitisedError>({ status: 409, data: 'some data' })

        lostBedService.createLostBed.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(generateConflictErrorAndRedirect).toHaveBeenCalledWith(
          request,
          response,
          premisesId,
          bedId,
          ['startDate', 'endDate'],
          err,
          paths.lostBeds.new({ premisesId, bedId }),
        )
      })
    })
  })

  describe('show', () => {
    it('shows the lost bed', async () => {
      const lostBed = lostBedFactory.build()
      lostBedService.getLostBed.mockResolvedValue(lostBed)

      const requestHandler = lostBedController.show()

      await requestHandler({ ...request, params: { premisesId, id: lostBed.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('lostBeds/show', {
        premisesId,
        lostBed,
      })
      expect(lostBedService.getLostBed).toHaveBeenCalledWith(token, premisesId, lostBed.id)
    })
  })
})
