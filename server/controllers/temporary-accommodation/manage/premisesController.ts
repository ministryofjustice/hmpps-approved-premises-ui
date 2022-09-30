import type { Request, Response, RequestHandler } from 'express'

import type { NewPremises } from 'temporary-accommodation'
import paths from '../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../services/temporary-accommodation/premisesService'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  new(): RequestHandler {
    return async (_req: Request, res: Response) => {
      return res.render('premises/new')
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: NewPremises = {
        ...req.body,
      }

      try {
        await this.premisesService.create(req.user.token, newPremises)

        req.flash('success', 'Property created')
        res.redirect(paths.premises.new({}))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new({}))
      }
    }
  }
}
