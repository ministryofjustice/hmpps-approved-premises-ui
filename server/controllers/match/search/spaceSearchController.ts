import type { Request, RequestHandler, Response } from 'express'

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

export default class SpaceSearchController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly placementRequestService: PlacementRequestService,
  ) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)

      let searchState = this.spaceService.getSpaceSearchState(req.params.id, req.session)

      if (!searchState) {
        searchState = this.spaceService.setSpaceSearchState(
          placementRequest.id,
          req.session,
          initialiseSearchState(placementRequest),
        )
      }

      const spaceSearchResults = await this.spaceService.search(req.user.token, searchState)

      res.render('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        spaceSearchResults,
        placementRequest,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
        formValues: searchState,
        apTypeRadioItems: apTypeRadioItems(searchState.apType),
        criteriaCheckboxGroups: [
          checkBoxesForCriteria(
            'AP requirements',
            'apCriteria',
            spaceSearchCriteriaApLevelLabels,
            searchState.apCriteria,
          ),
          checkBoxesForCriteria(
            'Room requirements',
            'roomCriteria',
            spaceSearchCriteriaRoomLevelLabels,
            searchState.roomCriteria,
          ),
        ],
      })
    }
  }
}
