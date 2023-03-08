import type { Request, RequestHandler, Response } from 'express'

import type { NewLostBed } from '@approved-premises/api'
import LostBedService from '../../services/lostBedService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'
import { DateFormats } from '../../utils/dateUtils'

export default class LostBedsController {
  constructor(private readonly lostBedService: LostBedService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const lostBedReasons = await this.lostBedService.getReferenceData(req.user.token)

      res.render('lostBeds/new', {
        premisesId,
        lostBedReasons,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const { startDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate')
      const { endDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate')

      const lostBed: NewLostBed = {
        ...req.body.lostBed,
        startDate,
        endDate,
        numberOfBeds: req.body.numberOfBeds ? Number(req.body.numberOfBeds) : undefined,
      }

      try {
        await this.lostBedService.createLostBed(req.user.token, premisesId, lostBed)

        req.flash('success', 'Lost bed logged')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.lostBeds.new({ premisesId }))
      }
    }
  }
}
