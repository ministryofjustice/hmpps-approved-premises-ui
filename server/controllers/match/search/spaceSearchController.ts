import type { Request, RequestHandler, Response } from 'express'

import { mapPlacementRequestToBedSearchParams } from '../../../utils/placementRequests/utils'
import { BedSearchParametersUi } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import SpaceService from '../../../services/spaceService'

import { startDateObjFromParams } from '../../../utils/matchUtils'
import { objectIfNotEmpty } from '../../../utils/utils'

export default class BedSearchController {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly placementRequestService: PlacementRequestService,
  ) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const searchParams = mapPlacementRequestToBedSearchParams(placementRequest)

      const query = objectIfNotEmpty<SpaceSearchParametersUi>(searchParams)
      const body = objectIfNotEmpty<SpaceSearchParametersUi>(req.body)

      const params = {
        ...query,
        ...body,
      }

      params.startDate = startDateObjFromParams(params).startDate
      params.requiredCharacteristics = [params.requiredCharacteristics].flat()

      const spaceSearchResults = await this.spaceService.search(req.user.token, params as BedSearchParametersUi)
      const tier = placementRequest?.risks?.tier?.value?.level || 'N/A'
      const selectedDesirableCriteria = [...placementRequest.desirableCriteria, ...params.requiredCharacteristics]

      res.render('match/search', {
        pageHeading: 'Find a space',
        spaceSearchResults,
        placementRequest,
        tier,
        selectedDesirableCriteria,
        formPath: matchPaths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }),
        ...params,
        ...startDateObjFromParams(params),
      })
    }
  }
}
