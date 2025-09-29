import { Cas1PlacementRequestDetail, FullPerson } from '@approved-premises/api'
import Page from '../../page'

export default class CheckCriteriaPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('Check the placement criteria')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }
}
