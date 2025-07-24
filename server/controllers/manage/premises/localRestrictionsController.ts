import type { Request, RequestHandler, Response } from 'express'
import { PremisesService } from '../../../services'
import paths from '../../../paths/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { localRestrictionsTableRows } from '../../../utils/premises'

export default class LocalRestrictionsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
      } = req

      const premises = await this.premisesService.find(token, premisesId)

      return res.render('manage/premises/localRestrictions/index', {
        backlink: paths.premises.show({ premisesId }),
        premises,
        restrictionsRows: localRestrictionsTableRows(premises),
      })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
      } = req
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const premises = await this.premisesService.find(token, premisesId)

      return res.render('manage/premises/localRestrictions/new', {
        backlink: paths.premises.localRestrictions.index({ premisesId }),
        premises,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
        body: { description },
      } = req

      try {
        if (!description) {
          throw new ValidationError({ description: 'Enter details for the restriction' })
        }

        if (description.length > 100) {
          throw new ValidationError({ description: 'The restriction must be less than 100 characters long' })
        }

        await this.premisesService.createLocalRestriction(token, premisesId, { description })

        req.flash('success', 'The restriction has been added.')
        return res.redirect(paths.premises.localRestrictions.index({ premisesId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.localRestrictions.new({ premisesId }),
        )
      }
    }
  }
}
