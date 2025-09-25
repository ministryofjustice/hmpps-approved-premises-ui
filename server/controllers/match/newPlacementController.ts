import { Request, Response, NextFunction, RequestHandler } from 'express'

import { NewPlacementFormData } from '@approved-premises/ui'
import adminPaths from '../../paths/admin'
import matchPaths from '../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { ValidationError } from '../../utils/errors'

type NewPlacementFormErrors = {
  [K in keyof NewPlacementFormData]?: string
}

export default class NewPlacementController {
  constructor() {}

  new(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = adminPaths.admin.placementRequests.show({ placementRequestId })

      return res.render('match/newPlacement/new', {
        backlink,
        pageHeading: 'New placement details',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { body } = req

      try {
        const errors: NewPlacementFormErrors = {}

        if (!body.startDate) {
          errors.startDate = 'Enter or select an arrival date'
        }
        if (!body.endDate) {
          errors.endDate = 'Enter or select a departure date'
        }
        if (!body.reason) {
          errors.reason = 'Enter a reason'
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        res.redirect(matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId }),
        )
      }
    }
  }
}
