import type { Request, RequestHandler, Response } from 'express'

import { mapPlacementRequestToSpaceSearchParams } from '../../../utils/placementRequests/utils'
import { SpaceSearchParametersUi } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import SpaceService from '../../../services/spaceService'

import { objectIfNotEmpty } from '../../../utils/utils'

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

      const tier = placementRequest?.risks?.tier?.value?.level || 'N/A'
      const spaceSearchResults = await this.spaceService.search(req.user.token, params)

      res.render('match/search', {
        pageHeading: 'Find a space',
        spaceSearchResults,
        placementRequest,
        tier,
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
        ...params,
      })
    }
  }
}
