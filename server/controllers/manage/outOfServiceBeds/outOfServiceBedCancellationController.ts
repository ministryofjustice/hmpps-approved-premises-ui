import type { Request, RequestHandler, Response } from 'express'
import { OutOfServiceBedService } from '../../../services'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/manage'

export default class OutOfServiceBedCancellationController {
  constructor(private readonly outOfServiceBedService: OutOfServiceBedService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)

      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)

      res.render('manage/outOfServiceBeds/cancel', {
        pageHeading: 'Cancel out of service bed',
        errors,
        errorSummary,
        errorTitle,
        outOfServiceBed,
        backLink: paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
        submitLink: paths.outOfServiceBeds.cancel({ premisesId, bedId, id }),
      })
    }
  }

  cancel(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedId, id } = req.params

      const outOfServiceBed = await this.outOfServiceBedService.getOutOfServiceBed(req.user.token, premisesId, id)
      const { bed, room } = outOfServiceBed
      try {
        await this.outOfServiceBedService.cancelOutOfServiceBed(req.user.token, id, premisesId, {})

        req.flash('success', `Cancelled out of service bed for ${room.name} ${bed.name}`)

        return res.redirect(paths.outOfServiceBeds.premisesIndex({ premisesId, temporality: 'current' }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.outOfServiceBeds.show({ premisesId, bedId, id, tab: 'details' }),
        )
      }
    }
  }
}
