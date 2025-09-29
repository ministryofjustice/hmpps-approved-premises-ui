import { Cas1PlacementRequestDetail, FullPerson } from '@approved-premises/api'
import Page from '../page'

export default class NewPlacementPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('New placement')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({ startDate, endDate, reason }: { startDate: string; endDate: string; reason: string }) {
    this.completeDatePicker('startDate', startDate)
    this.completeDatePicker('endDate', endDate)
    this.completeTextArea('reason', reason)
  }
}
