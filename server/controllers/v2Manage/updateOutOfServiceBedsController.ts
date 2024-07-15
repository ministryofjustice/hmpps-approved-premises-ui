import type { Request, RequestHandler, Response } from 'express'
import { OutOfServiceBedService, PremisesService } from '../../services'
import { DateFormats } from '../../utils/dateUtils'

import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../utils/validation'
import paths from '../../paths/manage'
import { SanitisedError } from '../../sanitisedError'
import { overwriteOoSBedWithUserInput } from '../../utils/outOfServiceBedUtils'

export default class OutOfServiceBedsController {
  constructor(
    private readonly outOfServiceBedService: OutOfServiceBedService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      const outOfServiceBedWithUserInput = overwriteOoSBedWithUserInput(userInput, outOfServiceBed)

      res.render('v2Manage/outOfServiceBeds/update', {
        pageHeading: 'updateOutOfServiceBedsController',
        premisesId,
        bedId,
        id,
        outOfServiceBedReasons,
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
        outOfServiceBed: outOfServiceBedWithUserInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params

      const { startDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate')
      const { endDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate')

      const outOfServiceBed = {
        reason: req.body.outOfServiceBed.reason,
        notes: req.body.outOfServiceBed.notes,
        referenceNumber: req.body.outOfServiceBed.referenceNumber,
        startDate,
        endDate,
      }

      try {
        await this.outOfServiceBedService.updateOutOfServiceBed(req.user.token, id, premisesId, outOfServiceBed)

        req.flash('success', 'The out of service bed record has been updated')
        return res.redirect(paths.v2Manage.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'timeline' }))
      } catch (error) {
        const redirectPath = paths.v2Manage.outOfServiceBeds.update({ premisesId, bedId, id })

        const knownError = error as SanitisedError

        if (knownError.status === 409 && 'data' in knownError) {
          return generateConflictErrorAndRedirect(
            req,
            res,
            premisesId,
            ['startDate', 'endDate'],
            knownError,
            redirectPath,
            bedId,
          )
        }

        return catchValidationErrorOrPropogate(req, res, knownError, redirectPath)
      }
    }
  }
}
