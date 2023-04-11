import type { Request, RequestHandler, Response } from 'express'

import { BedSearchParametersUi } from '../../@types/ui'
import matchPaths from '../../paths/match'
import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'
import { PersonService } from '../../services'
import BedService from '../../services/bedService'

import { startDateFromParams } from '../../utils/matchUtils'

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
  constructor(private readonly bedService: BedService, private readonly personService: PersonService) {}

  search(): RequestHandler {
    return async (req: Request, res: Response) => {
      const query = (Object.keys(req.query).length ? req.query : undefined) as unknown as BedSearchParametersUi
      const body = (Object.keys(req.body).length ? req.body : undefined) as unknown as BedSearchParametersUi

      const params = {
        ...query,
        ...body,
      }

      params.startDate = startDateFromParams(params)
      params.requiredCharacteristics = [...(params.selectedRequiredCharacteristics || params.requiredCharacteristics)]

      const bedSearchResults = await this.bedService.search(req.user.token, params as BedSearchParametersUi)
      const person = await this.personService.findByCrn(req.user.token, params.crn as string)

      res.render('match/search', {
        pageHeading: 'Find a bed',
        bedSearchResults,
        person,
        formPath: matchPaths.beds.search({}),
        assessmentPath: assessPaths.assessments.show({ id: params.assessmentId }),
        applicationPath: applyPaths.applications.show({ id: params.applicationId }),
        ...params,
        placementCriteria,
      })
    }
  }
}
