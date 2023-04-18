import type { Request, RequestHandler, Response } from 'express'

import { mapPlacementRequestToBedSearchParams } from '../../../utils/placementRequests/utils'
import { BedSearchParametersUi } from '../../../@types/ui'
import matchPaths from '../../../paths/match'
import assessPaths from '../../../paths/assess'
import applyPaths from '../../../paths/apply'
import { PlacementRequestService } from '../../../services'
import BedService from '../../../services/bedService'

import { startDateObjFromParams } from '../../../utils/matchUtils'
import { objectIfNotEmpty } from '../../../utils/utils'

export const placementCriteria = [
  'isIAP',
  'isPIPE',
  'isESAP',
  'isSemiSpecialistMentalHealth',
  'isRecoveryFocussed',
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'acceptsHateCrimeOffenders',
  'isCatered',
  'hasWideStepFreeAccess',
  'hasWideAccessToCommunalAreas',
  'hasStepFreeAccessToCommunalAreas',
  'hasWheelChairAccessibleBathrooms',
  'hasLift',
  'hasTactileFlooring',
  'hasBrailleSignage',
  'hasHearingLoop',
  'additionalRestrictions',
]

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
      params.requiredCharacteristics = [...(params.selectedRequiredCharacteristics || params.requiredCharacteristics)]

      const bedSearchResults = await this.bedService.search(req.user.token, params as BedSearchParametersUi)

      res.render('match/search', {
        pageHeading: 'Find a bed',
        bedSearchResults,
        person: placementRequest.person,
        formPath: matchPaths.placementRequests.beds.search({ id: placementRequest.id }),
        assessmentPath: assessPaths.assessments.show({ id: placementRequest.assessmentId }),
        applicationPath: applyPaths.applications.show({ id: placementRequest.applicationId }),
        ...params,
        ...startDateObjFromParams(params),
        placementCriteria,
      })
    }
  }
}
