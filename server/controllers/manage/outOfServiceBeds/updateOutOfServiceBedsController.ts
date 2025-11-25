import type { Request, RequestHandler, Response } from 'express'
import { OutOfServiceBedService } from '../../../services'
import { DateFormats } from '../../../utils/dateUtils'

import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateConflictErrorAndRedirect,
} from '../../../utils/validation'
import paths from '../../../paths/manage'
import { SanitisedError } from '../../../sanitisedError'
import {
  CreateOutOfServiceBedBody,
  outOfServiceBedSummaryList,
  validateOutOfServiceBedInput,
} from '../../../utils/outOfServiceBedUtils'

interface NewRequest extends Request {
  params: {
    premisesId: string
    bedId: string
    id: string
  }
}

interface CreateRequest extends NewRequest {
  body: CreateOutOfServiceBedBody
}

export default class UpdateOutOfServiceBedsController {
  constructor(private readonly outOfServiceBedService: OutOfServiceBedService) {}

  new(): RequestHandler {
    return async (req: NewRequest, res: Response) => {
      const { premisesId, bedId, id } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      const {
        reason: { id: reason },
        referenceNumber,
        notes,
      } = outOfServiceBed

      res.render('manage/outOfServiceBeds/update', {
        pageHeading: 'Update out of service bed record',
        backlink: paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
        outOfServiceBedSummary: outOfServiceBedSummaryList(outOfServiceBed),
        outOfServiceBedReasons,
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.startDate, 'startDate'),
        ...DateFormats.isoDateToDateInputs(outOfServiceBed.endDate, 'endDate'),
        reason,
        referenceNumber,
        notes,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: CreateRequest, res: Response) => {
      const { premisesId, bedId, id } = req.params

      try {
        const outOfServiceBedReasons = await this.outOfServiceBedService.getOutOfServiceBedReasons(req.user.token)
        const outOfServiceBed = validateOutOfServiceBedInput({
          body: req.body,
          user: req.session.user,
          outOfServiceBedReasons,
          suppressDateRangeCheck: true,
        })

        await this.outOfServiceBedService.updateOutOfServiceBed(req.user.token, id, premisesId, outOfServiceBed)

        req.flash('success', 'The out of service bed record has been updated')
        return res.redirect(paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'timeline' }))
      } catch (error) {
        const redirectPath = paths.outOfServiceBeds.update({ premisesId, bedId, id })

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
