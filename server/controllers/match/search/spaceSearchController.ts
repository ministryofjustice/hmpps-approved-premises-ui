import type { Request, RequestHandler, Response } from 'express'

import { mapPlacementRequestToSpaceSearchParams } from '../../../utils/placementRequests/utils'
import { SpaceSearchParametersUi } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import SpaceService from '../../../services/spaceService'

import { objectIfNotEmpty } from '../../../utils/utils'
import { placementRequestSummaryList } from '../../../utils/placementRequests/placementRequestSummaryList'

export default class SpaceSearchController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly placementRequestService: PlacementRequestService,
  ) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const searchParams = mapPlacementRequestToSpaceSearchParams(placementRequest)

      const query = objectIfNotEmpty<SpaceSearchParametersUi>(searchParams)
      const body = objectIfNotEmpty<SpaceSearchParametersUi>(req.body)

      const params = {
        ...query,
        ...body,
      }

      const spaceSearchResults = await this.spaceService.search(req.user.token, params)

      res.render('match/search', {
        pageHeading: 'Find a space in an Approved Premises',
        spaceSearchResults,
        placementRequest,
        placementRequestInfoSummaryList: placementRequestSummaryList(placementRequest, { showActions: false }),
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
        ...params,
      })
    }
  }
}
