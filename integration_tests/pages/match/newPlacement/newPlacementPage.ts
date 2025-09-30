import { Cas1PlacementRequestDetail, FullPerson } from '@approved-premises/api'
import Page from '../../page'

type NewPlacementForm = { arrivalDate: string; departureDate: string; reason: string }

export default class NewPlacementPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('New placement')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({ arrivalDate, departureDate, reason }: NewPlacementForm) {
    this.completeDatePicker('arrivalDate', arrivalDate)
    this.completeDatePicker('departureDate', departureDate)
    this.completeTextArea('reason', reason)
  }

  shouldBePopulated({ arrivalDate, departureDate, reason }: NewPlacementForm) {
    this.datePickerShouldContainDate('arrivalDate', arrivalDate)
    this.datePickerShouldContainDate('departureDate', departureDate)
    this.verifyTextInputContentsById('reason', reason)
  }
}
