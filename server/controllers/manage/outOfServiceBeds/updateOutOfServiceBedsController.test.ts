import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ErrorsAndUserInput } from '@approved-premises/ui'
import { Cas1OutOfServiceBedReason } from '@approved-premises/api'
import { OutOfServiceBedService } from '../../../services'
import { outOfServiceBedFactory } from '../../../testutils/factories'
import UpdateOutOfServiceBedsController from './updateOutOfServiceBedsController'

import { DateFormats } from '../../../utils/dateUtils'
import paths from '../../../paths/manage'
import { SanitisedError } from '../../../sanitisedError'
import outOfServiceBedReasonsJson from '../../../testutils/referenceData/stubs/cas1/out-of-service-bed-reasons.json'
import * as validationUtils from '../../../utils/validation'
import { outOfServiceBedSummaryList } from '../../../utils/outOfServiceBedUtils'
import { ValidationError } from '../../../utils/errors'
import * as outOfServiceBedUtils from '../../../utils/outOfServiceBedUtils'

describe('updateOutOfServiceBedController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})
  const errorsAndUserInput = createMock<ErrorsAndUserInput>({
    userInput: {},
  })

  const outOfServiceBedService = createMock<OutOfServiceBedService>({})

  const updateOutOfServiceBedController = new UpdateOutOfServiceBedsController(outOfServiceBedService)
  const premisesId = 'premisesId'
  const outOfServiceBed = outOfServiceBedFactory.build()

  beforeEach(() => {
    jest.restoreAllMocks()
    request = createMock<Request>({
      user: { token },
      params: {
        premisesId,
        bedId: outOfServiceBed.bed.id,
        id: outOfServiceBed.id,
      },
    })

    outOfServiceBedService.getOutOfServiceBed.mockResolvedValue(outOfServiceBed)
    outOfServiceBedService.getOutOfServiceBedReasons.mockResolvedValue(
      outOfServiceBedReasonsJson as Array<Cas1OutOfServiceBedReason>,
    )

    jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue(errorsAndUserInput)
    jest.spyOn(validationUtils, 'catchValidationErrorOrPropogate').mockReturnValue(undefined)
  })

  describe('new', () => {
    it('renders the form with existing OOSB data apart from notes, and any errors', async () => {
      await updateOutOfServiceBedController.new()(request, response, next)

      expect(outOfServiceBedService.getOutOfServiceBed).toHaveBeenCalledWith(token, premisesId, outOfServiceBed.id)
      expect(response.render).toHaveBeenCalledWith('manage/outOfServiceBeds/update', {
        pageHeading: 'Update out of service bed record',
        backlink: paths.outOfServiceBeds.show({
          premisesId: request.params.premisesId,
          bedId: request.params.bedId,
          id: request.params.id,
          tab: 'details',
        }),
        outOfServiceBedSummary: outOfServiceBedSummaryList(outOfServiceBed),
        outOfServiceBedReasons: outOfServiceBedReasonsJson,
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
        reason: outOfServiceBed.reason.id,
        referenceNumber: outOfServiceBed.referenceNumber,
        notes: outOfServiceBed.notes,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        errorTitle: errorsAndUserInput.errorTitle,
      })
    })

    describe('if there is an error for a field', () => {
      it('overwrites the pre-existing OoS bed record when there is more recent user input ', async () => {
        const userInput = {
          'startDate-year': '2025',
          'startDate-month': '6',
          'startDate-day': '1',
          'endDate-year': '2025',
          'endDate-month': '6',
          'endDate-day': '12',
          referenceNumber: 'new reference number',
        }
        jest.spyOn(validationUtils, 'fetchErrorsAndUserInput').mockReturnValue({ ...errorsAndUserInput, userInput })

        await updateOutOfServiceBedController.new()(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'manage/outOfServiceBeds/update',
          expect.objectContaining({
            ...userInput,
          }),
        )
      })
    })
  })

  describe('create', () => {
    const validBody = {
      'startDate-year': 2026,
      'startDate-month': 8,
      'startDate-day': 22,
      'endDate-year': 2026,
      'endDate-month': 9,
      'endDate-day': 22,
      reason: outOfServiceBedReasonsJson.find(reason => reason.referenceType === 'workOrder').id,
      referenceNumber: '',
      notes: 'Some notes',
    }

    it('updates the OOSB record and redirects to the OOSB details page', async () => {
      request.body = validBody

      await updateOutOfServiceBedController.create()(request, response, next)

      expect(outOfServiceBedService.updateOutOfServiceBed).toHaveBeenCalledWith(token, outOfServiceBed.id, premisesId, {
        startDate: '2026-08-22',
        endDate: '2026-09-22',
        reason: request.body.reason,
        referenceNumber: request.body.referenceNumber,
        notes: request.body.notes,
      })
      expect(request.flash).toHaveBeenCalledWith('success', 'The out of service bed record has been updated')
      expect(response.redirect).toHaveBeenCalledWith(
        paths.outOfServiceBeds.show({
          premisesId,
          bedId: outOfServiceBed.bed.id,
          id: outOfServiceBed.id,
          tab: 'timeline',
        }),
      )
    })

    it('should handle validation errors and redirect to the form', async () => {
      jest.spyOn(outOfServiceBedUtils, 'validateOutOfServiceBedInput').mockImplementation(() => {
        throw new ValidationError({
          notes: 'You must provide detail on why the bed is out of service',
        })
      })

      await updateOutOfServiceBedController.create()(request, response, next)

      expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        new ValidationError({}),
        paths.outOfServiceBeds.update({
          premisesId: request.params.premisesId,
          bedId: request.params.bedId,
          id: request.params.id,
        }),
      )

      const errorData = (validationUtils.catchValidationErrorOrPropogate as jest.Mock).mock.lastCall[2].data
      expect(errorData).toEqual({
        notes: 'You must provide detail on why the bed is out of service',
      })
    })

    describe('when errors are raised by the API', () => {
      beforeEach(() => {
        request.body = { ...validBody }
      })

      it('should call catchValidationErrorOrPropogate with a standard error', async () => {
        const err = new Error('API error: cannot update OOSB record')

        outOfServiceBedService.updateOutOfServiceBed.mockRejectedValue(err)

        await updateOutOfServiceBedController.create()(request, response, next)

        expect(validationUtils.catchValidationErrorOrPropogate).toHaveBeenCalledWith(
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
        jest.spyOn(validationUtils, 'generateConflictErrorAndRedirect')

        const err = createMock<SanitisedError>({
          status: 409,
          data: {
            detail:
              'An out-of-service bed already exists for dates from 2024-10-01 to 2024-10-14 which overlaps with the desired dates: 220a71da-bf5c-424d-94ff-254ecac5b857',
          },
        })
        outOfServiceBedService.updateOutOfServiceBed.mockRejectedValue(err)

        await updateOutOfServiceBedController.create()(request, response, next)

        expect(validationUtils.generateConflictErrorAndRedirect).toHaveBeenCalledWith(
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
