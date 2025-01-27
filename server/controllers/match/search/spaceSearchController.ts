import type { Request, RequestHandler, Response } from 'express'

import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import SpaceService from '../../../services/spaceService'

import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'
import {
  apTypeRadioItems,
  checkBoxesForCriteria,
  initialiseSearchState,
  spaceSearchCriteriaApLevelLabels,
  spaceSearchCriteriaRoomLevelLabels,
} from '../../../utils/match/spaceSearch'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { ValidationError } from '../../../utils/errors'

export default class SpaceSearchController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly placementRequestService: PlacementRequestService,
  ) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { id } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)

      if (req.headers?.referer?.includes(paths.admin.placementRequests.show({ id }))) {
        this.spaceService.removeSpaceSearchState(id, req.session)
      }

      let searchState = this.spaceService.getSpaceSearchState(id, req.session)

      if (!searchState) {
        searchState = this.spaceService.setSpaceSearchState(
          placementRequest.id,
          req.session,
          initialiseSearchState(placementRequest),
        )
      }

      const spaceSearchResults = await this.spaceService.search(token, searchState)

      const formValues = {
        ...searchState,
        ...userInput,
      }

      res.render('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        spaceSearchResults,
        placementRequest,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
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
          checkBoxesForCriteria(
            'Room requirements',
            'roomCriteria',
            spaceSearchCriteriaRoomLevelLabels,
            formValues.roomCriteria,
          ),
        ],
      })
    }
  }

  filterSearch(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { postcode, apType, apCriteria = [], roomCriteria = [] } = req.body

        if (!postcode) {
          throw new ValidationError({
            postcode: 'Enter a postcode',
          })
        }

        this.spaceService.setSpaceSearchState(req.params.id, req.session, {
          postcode,
          apType,
          apCriteria,
          roomCriteria,
        })

        return res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ id: req.params.id }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.search.spaces({ id: req.params.id }),
        )
      }
    }
  }
}
