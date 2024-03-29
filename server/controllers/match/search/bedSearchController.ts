import type { Request, RequestHandler, Response } from 'express'

import { mapPlacementRequestToBedSearchParams } from '../../../utils/placementRequests/utils'
import { BedSearchParametersUi } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import { PlacementRequestService } from '../../../services'
import BedService from '../../../services/bedService'

import { startDateObjFromParams } from '../../../utils/matchUtils'
import { objectIfNotEmpty } from '../../../utils/utils'

export default class BedSearchController {
  constructor(
    private readonly bedService: BedService,
    private readonly placementRequestService: PlacementRequestService,
  ) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const searchParams = mapPlacementRequestToBedSearchParams(placementRequest)

      const query = objectIfNotEmpty<BedSearchParametersUi>(searchParams)
      const body = objectIfNotEmpty<BedSearchParametersUi>(req.body)

      const params = {
        ...query,
        ...body,
      }

      params.startDate = startDateObjFromParams(params).startDate
      params.requiredCharacteristics = [params.requiredCharacteristics].flat()

      const bedSearchResults = await this.bedService.search(req.user.token, params as BedSearchParametersUi)
      const tier = placementRequest?.risks?.tier?.value?.level || 'N/A'
      const selectedDesirableCriteria = [...placementRequest.desirableCriteria, ...params.requiredCharacteristics]

      res.render('match/search', {
        pageHeading: 'Find a bed',
        bedSearchResults,
        placementRequest,
        tier,
        selectedDesirableCriteria,
        formPath: matchPaths.placementRequests.beds.search({ id: placementRequest.id }),
        ...params,
        ...startDateObjFromParams(params),
      })
    }
  }
}
