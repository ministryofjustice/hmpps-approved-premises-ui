import { Request, Response, NextFunction, RequestHandler } from 'express'

import adminPaths from '../../paths/admin'
import matchPaths from '../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { criteriaSummaryList, validateNewPlacement } from '../../utils/match/newPlacement'
import { PlacementRequestService } from '../../services'

export default class NewPlacementController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

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

        res.redirect(matchPaths.v2Match.placementRequests.newPlacement.criteria({ placementRequestId }))
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

  criteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      return res.render('match/newPlacement/check-criteria', {
        backlink,
        pageHeading: 'Check the placement criteria',
        criteriaSummary: criteriaSummaryList(placementRequest),
        criteriaChangedRadioItems: [
          {
            value: 'yes',
            text: 'Yes',
          },
          {
            text: 'No',
            value: 'no',
          },
        ],
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}
