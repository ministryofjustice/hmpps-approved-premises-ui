import type { Request, RequestHandler, Response } from 'express'
import { PremisesService } from '../../../services'
import paths from '../../../paths/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'

export default class LocalRestrictionsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const premises = await this.premisesService.find(req.user.token, premisesId)

      return res.render('manage/premises/localRestrictions/index', {
        backlink: paths.premises.show({ premisesId: premises.id }),
        premises,
        restrictions: premises.localRestrictions,
      })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const premises = await this.premisesService.find(req.user.token, premisesId)

      return res.render('manage/premises/localRestrictions/new', {
        backlink: paths.premises.localRestrictions.index({ premisesId: premises.id }),
        premises,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        if (!req.body.description) {
          throw new ValidationError({ description: 'Enter details for the restriction' })
        }

        if (req.body.description.length > 100) {
          throw new ValidationError({ description: 'The restriction must be less than 100 characters long' })
        }

        return res.redirect('/')
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.localRestrictions.new({ premisesId: req.params.premisesId }),
        )
      }
    }
  }
}
