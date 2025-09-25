import { Request, Response, NextFunction, RequestHandler } from 'express'

import adminPaths from '../../paths/admin'
import matchPaths from '../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { validateNewPlacement } from '../../utils/match/newPlacement'

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
        validateNewPlacement(body)

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
