import { Request, Response, NextFunction, RequestHandler } from 'express'

import adminPaths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { criteriaSummaryList, validateNewPlacement } from '../../../utils/match/newPlacement'
import { PlacementRequestService } from '../../../services'
import { personKeyDetails } from '../../../utils/placements'
import { ValidationError } from '../../../utils/errors'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  filterApLevelCriteria,
  filterRoomLevelCriteria,
} from '../../../utils/match/spaceSearch'
import { applyApTypeToAssessApType, type ApTypeSpecialist } from '../../../utils/placementCriteriaUtils'
import { spaceSearchCriteriaApLevelLabels } from '../../../utils/match/spaceSearchLabels'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'

export default class NewPlacementController {
  constructor(private readonly placementRequestService: PlacementRequestService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = adminPaths.admin.placementRequests.show({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      return res.render('match/newPlacement/new', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
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

        // TODO: save data into session

        res.redirect(matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId }))
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

  checkCriteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = matchPaths.v2Match.placementRequests.newPlacement.new({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      return res.render('match/newPlacement/check-criteria', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
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

  saveCheckCriteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { body } = req

      try {
        const { criteriaChanged } = body

        if (!criteriaChanged) {
          throw new ValidationError({ criteriaChanged: 'Select if the criteria have changed' })
        }

        // TODO: save data into session

        const redirect =
          criteriaChanged === 'yes'
            ? matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({ placementRequestId })
            : matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId })

        res.redirect(redirect)
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId }),
        )
      }
    }
  }

  updateCriteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const backlink = matchPaths.v2Match.placementRequests.newPlacement.checkCriteria({ placementRequestId })

      const placementRequest = await this.placementRequestService.getPlacementRequest(
        req.user.token,
        placementRequestId,
      )

      return res.render('match/newPlacement/update-criteria', {
        contextKeyDetails: personKeyDetails(placementRequest.person, placementRequest.risks.tier.value.level),
        backlink,
        pageHeading: 'Update the placement criteria',
        typeOfApRadioItems: apTypeRadioItems(
          applyApTypeToAssessApType[placementRequest.type as ApTypeSpecialist] || 'normal',
        ),
        criteriaCheckboxGroups: [
          checkBoxesForCriteria(
            'AP requirements',
            'apCriteria',
            spaceSearchCriteriaApLevelLabels,
            filterApLevelCriteria(placementRequest.essentialCriteria),
          ),
          checkBoxesForCriteria(
            'Room requirements',
            'roomCriteria',
            roomCharacteristicMap,
            filterRoomLevelCriteria(placementRequest.essentialCriteria),
          ),
        ],
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  saveUpdateCriteria(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { placementRequestId } = req.params

      try {
        const { typeOfAp } = req.body

        if (!typeOfAp) {
          throw new ValidationError({ typeOfAp: 'Select the type of AP' })
        }

        // TODO: save data into session

        res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.newPlacement.updateCriteria({ placementRequestId }),
        )
      }
    }
  }
}
