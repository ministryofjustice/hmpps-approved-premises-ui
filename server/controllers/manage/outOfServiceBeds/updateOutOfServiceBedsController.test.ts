import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { when } from 'jest-when'

import { UpdateCas1OutOfServiceBed } from '@approved-premises/api'
import { ErrorsAndUserInput } from '@approved-premises/ui'
import { OutOfServiceBedService } from '../../../services'
import { outOfServiceBedFactory } from '../../../testutils/factories'
import UpdateOutOfServiceBedsController from './updateOutOfServiceBedsController'

import { DateFormats } from '../../../utils/dateUtils'
import paths from '../../../paths/manage'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../../utils/validation'
import { SanitisedError } from '../../../sanitisedError'
import * as OoSBedUtils from '../../../utils/outOfServiceBedUtils'

jest.mock('../../utils/validation')

describe('updateOutOfServiceBedController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})

  const updateOutOfServiceBedController = new UpdateOutOfServiceBedsController(outOfServiceBedService)
  const premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.resetAllMocks()
    request = createMock<Request>({
      user: { token },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      },
    })
    when(outOfServiceBedService.getOutOfServiceBed)
      .calledWith(request.user.token, premisesId, outOfServiceBed.id)
      .mockResolvedValue(outOfServiceBed)

    when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue({
      errors: {},
      errorSummary: [],
      userInput: {},
    })
  })

  describe('new', () => {
    it('passes the premises, bed and OoS bed IDs through to the view when called', async () => {
      const requestHandler = updateOutOfServiceBedController.new()

      request.params = {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      }

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/update',
        expect.objectContaining({
          premisesId: request.params.premisesId,
          bedId: request.params.bedId,
          id: request.params.id,
        }),
      )
    })

    it('calls the OoS bed service "get" method and passes the result to the review', async () => {
      when(outOfServiceBedService.getOutOfServiceBed)
        .calledWith(request.user.token, premisesId, outOfServiceBed.id)
        .mockResolvedValue(outOfServiceBed)

      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/update',
        expect.objectContaining({
          outOfServiceBed,
        }),
      )
    })

    it('formats the start and end dates so they can prepopulate the inputs', async () => {
      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'manage/outOfServiceBeds/update',
        expect.objectContaining({
          ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
          ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
        }),
      )
    })

    it('renders the form with errors and user input if theres an error', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        }),
      )
    })

    it('renders the form with errors and user input if theres an error', async () => {
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

      const requestHandler = updateOutOfServiceBedController.new()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        }),
      )
    })

    describe('if there is an error for a field', () => {
      it('overwrites the pre-existing OoS bed record when there is more recent user input ', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>({
          userInput: {
            startDate: '2025-06-01',
            endDate: '2025-06-01',
            referenceNumber: 'new reference number',
          },
        })
        when(fetchErrorsAndUserInput).calledWith(request).mockReturnValue(errorsAndUserInput)

        const spy = jest
          .spyOn(OoSBedUtils, 'overwriteOoSBedWithUserInput')
          .mockReturnValue({ ...outOfServiceBed, ...errorsAndUserInput.userInput })

        const requestHandler = updateOutOfServiceBedController.new()

        await requestHandler(request, response, next)

        expect(spy).toHaveBeenCalledWith(errorsAndUserInput.userInput, outOfServiceBed)
        expect(response.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            startDate: errorsAndUserInput.userInput.startDate,
            endDate: errorsAndUserInput.userInput.endDate,
            referenceNumber: errorsAndUserInput.userInput.referenceNumber,
          }),
        )
      })
    })
  })

  describe('create', () => {
    const startDateFromInputs = DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate')
    const endDateFromInputs = DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate')

    const outOfServiceBedUpdate: UpdateCas1OutOfServiceBed = {
      startDate: startDateFromInputs.startDate,
      endDate: endDateFromInputs.endDate,
      reason: outOfServiceBed.reason.id,
      notes: outOfServiceBed.notes,
      referenceNumber: outOfServiceBed.referenceNumber,
    }

    it('calls the OoS bed service "update" method with the correct parameters', async () => {
      const requestBody = {
        outOfServiceBed: { ...outOfServiceBedUpdate },
        ...startDateFromInputs,
        ...endDateFromInputs,
      }

      request.body = requestBody

      const requestHandler = updateOutOfServiceBedController.create()

      await requestHandler(request, response, next)

      expect(outOfServiceBedService.updateOutOfServiceBed).toHaveBeenCalledWith(
        token,
        outOfServiceBed.id,
        premisesId,
        outOfServiceBedUpdate,
      )
    })

    it('redirects to the show page with a success message if the update is successful', async () => {
      const requestBody = {
        outOfServiceBed: { ...outOfServiceBedUpdate },
        ...startDateFromInputs,
        ...endDateFromInputs,
      }

      request.body = requestBody

      const requestHandler = updateOutOfServiceBedController.create()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.outOfServiceBeds.show({
          premisesId,
          bedId: outOfServiceBed.bed.id,
          id: outOfServiceBed.id,
          tab: 'timeline',
        }),
      )
      expect(request.flash).toHaveBeenCalledWith('success', expect.any(String))
    })

    describe('when errors are raised', () => {
      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const requestBody = {
          outOfServiceBed: { ...outOfServiceBedUpdate },
          ...startDateFromInputs,
          ...endDateFromInputs,
        }

        request.body = requestBody

        const requestHandler = updateOutOfServiceBedController.create()

        const err = new Error()

        outOfServiceBedService.updateOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.outOfServiceBeds.update({
            premisesId,
            bedId: outOfServiceBed.bed.id,
            id: outOfServiceBed.id,
          }),
        )
      })

      it('should call generateConflictErrorAndRedirect if the error is a 409', async () => {
        const requestBody = {
          outOfServiceBed: { ...outOfServiceBedUpdate },
          ...startDateFromInputs,
          ...endDateFromInputs,
        }

        request.body = requestBody

        const requestHandler = updateOutOfServiceBedController.create()
        const err = createMock<SanitisedError>({ status: 409, data: 'some data' })

        outOfServiceBedService.updateOutOfServiceBed.mockRejectedValue(err)

        await requestHandler(request, response, next)

        expect(generateConflictErrorAndRedirect).toHaveBeenCalledWith(
          { ...request },
          { ...response },
          premisesId,
          ['startDate', 'endDate'],
          err,
          paths.outOfServiceBeds.update({
            premisesId,
            bedId: outOfServiceBed.bed.id,
            id: outOfServiceBed.id,
          }),
          outOfServiceBed.bed.id,
        )
      })
    })
  })
})
