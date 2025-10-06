import { Cas1PlacementRequestDetail, FullPerson } from '@approved-premises/api'
import Page from '../../page'

type NewPlacementForm = {
  newPlacementArrivalDate: string
  newPlacementDepartureDate: string
  newPlacementReason: string
}

export default class NewPlacementPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('New placement')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({ newPlacementArrivalDate, newPlacementDepartureDate, newPlacementReason }: NewPlacementForm) {
    this.completeDatePicker('newPlacementArrivalDate', newPlacementArrivalDate)
    this.completeDatePicker('newPlacementDepartureDate', newPlacementDepartureDate)
    this.completeTextArea('newPlacementReason', newPlacementReason)
  }

  shouldBePopulated({ newPlacementArrivalDate, newPlacementDepartureDate, newPlacementReason }: NewPlacementForm) {
    this.datePickerShouldContainDate('newPlacementArrivalDate', newPlacementArrivalDate)
    this.datePickerShouldContainDate('newPlacementDepartureDate', newPlacementDepartureDate)
    this.verifyTextInputContentsById('newPlacementReason', newPlacementReason)
  }
}
