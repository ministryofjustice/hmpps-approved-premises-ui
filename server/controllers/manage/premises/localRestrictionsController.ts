import type { Request, RequestHandler, Response } from 'express'
import { PremisesService } from '../../../services'
import paths from '../../../paths/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { localRestrictionsTableRows } from '../../../utils/premises'
import { characteristicsBulletList } from '../../../utils/characteristicsUtils'
import { spaceSearchResultsCharacteristicsLabels } from '../../../utils/match/spaceSearchLabels'

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
        characteristics: characteristicsBulletList(premises.characteristics, {
          labels: spaceSearchResultsCharacteristicsLabels,
        }),
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
          throw new ValidationError({ description: 'The restriction must be 100 characters or less' })
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

  confirmRemove(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId, restrictionId },
      } = req

      const { errorSummary } = fetchErrorsAndUserInput(req)

      const premises = await this.premisesService.find(token, premisesId)

      const restrictionToRemove = premises.localRestrictions.find(restriction => restriction.id === restrictionId)

      return res.render('manage/premises/localRestrictions/confirmRemove', {
        backlink: paths.premises.localRestrictions.index({ premisesId }),
        premises,
        restriction: restrictionToRemove,
        errorSummary,
      })
    }
  }

  remove(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId, restrictionId },
      } = req

      try {
        await this.premisesService.deleteLocalRestriction(token, premisesId, restrictionId)

        req.flash('success', 'The restriction has been removed.')
        return res.redirect(paths.premises.localRestrictions.index({ premisesId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.localRestrictions.remove({ premisesId, restrictionId }),
        )
      }
    }
  }
}
