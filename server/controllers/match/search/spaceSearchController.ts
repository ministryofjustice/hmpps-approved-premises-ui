import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import SpaceSearchService from '../../../services/spaceSearchService'

import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  initialiseSearchState,
  summaryCards,
} from '../../../utils/match/spaceSearch'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'
import { roomCharacteristicMap } from '../../../utils/characteristicsUtils'
import MultiPageFormManager from '../../../utils/multiPageFormManager'
import { spaceSearchCriteriaApLevelLabels } from '../../../utils/match/spaceSearchLabels'

export default class SpaceSearchController {
  formData: MultiPageFormManager<'spaceSearch'>

  constructor(
    private readonly spaceSearchService: SpaceSearchService,
    private readonly placementRequestService: PlacementRequestService,
  ) {
    this.formData = new MultiPageFormManager('spaceSearch')
  }

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { placementRequestId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, placementRequestId)

      if (req.headers?.referer?.includes(paths.admin.placementRequests.show({ placementRequestId }))) {
        await this.formData.remove(placementRequestId, req.session)
      }

      const searchState =
        this.formData.get(placementRequestId, req.session) ||
        (await this.formData.update(placementRequest.id, req.session, initialiseSearchState(placementRequest)))

      const spaceSearchResults = (await this.spaceSearchService.search(token, searchState)).results

      const formValues = {
        ...searchState,
        ...userInput,
      }

      res.render('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        summaryCards: summaryCards(
          spaceSearchResults,
          formValues.postcode,
          placementRequest.application.isWomensApplication,
        ),
        placementRequest,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }),
        errors,
        errorSummary,
        ...formValues,
        apTypeRadioItems: apTypeRadioItems(formValues.apType),
        criteriaCheckboxGroups: [
          checkBoxesForCriteria(
            'AP requirements',
            'apCriteria',
            spaceSearchCriteriaApLevelLabels,
            formValues.apCriteria,
          ),
          checkBoxesForCriteria('Room requirements', 'roomCriteria', roomCharacteristicMap, formValues.roomCriteria),
        ],
      })
    }
  }

  filterSearch(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { placementRequestId } = req.params
      try {
        const { postcode, apType, apCriteria = [], roomCriteria = [] } = req.body

        if (!postcode) {
          throw new ValidationError({
            postcode: 'Enter a postcode',
          })
        }

        await this.formData.update(placementRequestId, req.session, {
          postcode,
          apType,
          apCriteria,
          roomCriteria,
        })

        return res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }),
        )
      }
    }
  }
}
