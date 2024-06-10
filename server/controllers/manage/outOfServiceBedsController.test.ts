import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import { SanitisedError } from '../../sanitisedError'
import OutOfServiceBedService from '../../services/outOfServiceBedService'
import OutOfServiceBedsController from './outOfServiceBedsController'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'

import paths from '../../paths/manage'
import { outOfServiceBedCancellationFactory, outOfServiceBedFactory } from '../../testutils/factories'

jest.mock('../../utils/validation')
jest.mock('../../utils/bookings')

describe('OutOfServiceBedsController', () => {
  const token = 'SOME_TOKEN'
  const referrer = 'http://localhost/foo/bar'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})

  const outOfServiceBedController = new OutOfServiceBedsController(outOfServiceBedService)
  const premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      headers: { referer: referrer },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
      },
    })
  })

  describe('new', () => {
    it('renders the form', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'outOfServiceBeds/new',
        expect.objectContaining({ premisesId, bedId: request.params.bedId }),
      )
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()

      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = outOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'outOfServiceBeds/new',
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          errorTitle: errorsAndUserInput.errorTitle,
          ...errorsAndUserInput.userInput,
        }),
      )
    })
  })

  describe('create', () => {
    it('creates a outOfService bed and redirects to the premises page', async () => {
      const requestHandler = outOfServiceBedController.create()

      request.params = {
        ...request.params,
        bedId: outOfServiceBed.bed.id,
      }

      request.body = {
        'outOfServiceFrom-year': 2022,
        'outOfServiceFrom-month': 8,
        'outOfServiceFrom-day': 22,
        'outOfServiceTo-year': 2022,
        'outOfServiceTo-month': 9,
        'outOfServiceTo-day': 22,
        outOfServiceBed,
      }

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.createOutOfServiceBed).toHaveBeenCalledWith(token, premisesId, {
        ...outOfServiceBed,
        outOfServiceFrom: '2022-08-22',
        outOfServiceTo: '2022-09-22',
        bedId: request.params.bedId,
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'Out of service bed logged')
      expect(response.redirect).toHaveBeenCalledWith(paths.premises.show({ premisesId: request.params.premisesId }))
    })

    describe('when errors are raised', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestHandler = outOfServiceBedController.create()

        const err = new Error()

        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.v2Manage.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        const requestHandler = outOfServiceBedController.create()
        const err = createMock<SanitisedError>({ status: 409, data: 'some data' })

        outOfServiceBedService.createOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(generateConflictErrorAndRedirect).toHaveBeenCalledWith(
          { ...request },
          { ...response },
          premisesId,
          ['outOfServiceFrom', 'outOfServiceTo'],
          err,
          paths.v2Manage.outOfServiceBeds.new({ premisesId: request.params.premisesId, bedId: request.params.bedId }),
          outOfServiceBed.bed.id,
        )
      })
    })
  })

  describe('show', () => {
    it('shows the outOfService bed', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)
      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, request.params.premisesId, request.params.id)
        .mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedController.show()

      request.params = {
        ...request.params,
        bedId: outOfServiceBed.bed.id,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'outOfServiceBeds/show',
        expect.objectContaining({ outOfServiceBed }),
      )
    })
  })

  describe('premisesIndex', () => {
    it('shows a list of outOfService beds for a premises', async () => {
      outOfServiceBedService.getOutOfServiceBedsForAPremises.mockResolvedValue([outOfServiceBed])
      const requestHandler = outOfServiceBedController.premisesIndex()

      await requestHandler({ ...request, params: { premisesId } }, response, next)

      expect(response.render).toHaveBeenCalledWith('outOfServiceBeds/premisesIndex', {
        outOfServiceBeds: [outOfServiceBed],
        pageHeading: 'Manage out of service beds',
        premisesId,
      })
      expect(outOfServiceBedService.getOutOfServiceBedsForAPremises).toHaveBeenCalledWith(token, premisesId)
    })
  })

  describe('index', () => {
    it('shows a list of all outOfService beds', async () => {
      outOfServiceBedService.getAllOutOfServiceBeds.mockResolvedValue([outOfServiceBed])
      const requestHandler = outOfServiceBedController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('outOfServiceBeds/index', {
        outOfServiceBeds: [outOfServiceBed],
        pageHeading: 'View out of service beds',
      })
      expect(outOfServiceBedService.getAllOutOfServiceBeds).toHaveBeenCalledWith(token)
    })
  })

  describe('update', () => {
    it('updates a outOfService bed and redirects to the outOfService beds index page', async () => {
      outOfServiceBedService.updateOutOfServiceBed.mockResolvedValue(outOfServiceBed)

      const requestHandler = outOfServiceBedController.update()

      request.params = {
        premisesId,
        id: outOfServiceBed.bed.id,
      }

      request.body = {
        'outOfServiceTo-year': 2022,
        'outOfServiceTo-month': 9,
        'outOfServiceTo-day': 22,
        notes: 'a note',
        outOfServiceFrom: outOfServiceBed.outOfServiceFrom,
        reason: outOfServiceBed.reason.id,
        referenceNumber: outOfServiceBed.referenceNumber,
        submit: '',
      }

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.updateOutOfServiceBed).toHaveBeenCalledWith(
        request.user.token,
        outOfServiceBed.bed.id,
        request.params.premisesId,
        request.body,
      )
      expect(request.flash).toHaveBeenCalledWith('success', 'Bed updated')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: request.params.premisesId }),
      )
    })

    describe('when there are errors', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error()

        outOfServiceBedService.updateOutOfServiceBed.mockImplementation(() => {
          throw err
        })

        const requestHandler = outOfServiceBedController.update()

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, { ...response }, err, referrer)
      })
    })

    describe('if "cancel" is "1" ', () => {
      it('updates a outOfService bed and redirects to the outOfService beds index page', async () => {
        const cancellation = outOfServiceBedCancellationFactory.build()
        outOfServiceBedService.cancelOutOfServiceBed.mockResolvedValue(cancellation)

        const requestHandler = outOfServiceBedController.cancel()

        const notes = 'a note'

        request.params = {
          premisesId,
          id: cancellation.id,
          bedId: 'bedId',
        }

        request.body = {
          notes,
          cancel: '1',
        }

        await requestHandler(request, response, next)

        expect(outOfServiceBedService.cancelOutOfServiceBed).toHaveBeenCalledWith(
          token,
          cancellation.id,
          request.params.premisesId,
          {
            notes,
          },
        )
        expect(request.flash).toHaveBeenCalledWith('success', 'Bed cancelled')
        expect(response.redirect).toHaveBeenCalledWith(
          paths.v2Manage.outOfServiceBeds.premisesIndex({ premisesId: request.params.premisesId }),
        )
      })
    })
  })
})
