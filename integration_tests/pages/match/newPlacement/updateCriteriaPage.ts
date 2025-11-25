import {
  Cas1PlacementRequestDetail,
  Cas1SpaceBookingCharacteristic,
  Cas1SpaceCharacteristic,
  FullPerson,
} from '@approved-premises/api'
import Page from '../../page'
import { ApTypeCriteria, apTypeCriteriaLabels } from '../../../../server/utils/placementCriteriaUtils'
import { spaceSearchCriteriaApLevelLabels, roomCharacteristicMap } from '../../../../server/utils/characteristicsUtils'

export default class UpdateCriteriaPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('Update placement transfer criteria')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({
    typeOfAp,
    apCriteria,
    roomCriteria,
  }: {
    typeOfAp: ApTypeCriteria
    apCriteria: Cas1SpaceCharacteristic[]
    roomCriteria: Cas1SpaceBookingCharacteristic[]
  }) {
    cy.get('[type="checkbox"]').uncheck()

    this.checkRadioByLabel(apTypeCriteriaLabels[typeOfAp])
    apCriteria.forEach(criteria => this.checkCheckboxByLabel(spaceSearchCriteriaApLevelLabels[criteria]))
    roomCriteria.forEach(criteria => this.checkCheckboxByLabel(roomCharacteristicMap[criteria]))
  }
}
