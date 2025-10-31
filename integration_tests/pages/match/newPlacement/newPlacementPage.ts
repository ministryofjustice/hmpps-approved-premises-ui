import { Cas1PlacementRequestDetail, FullPerson, TransferReason } from '@approved-premises/api'
import Page from '../../page'
import { newPlacementReasons } from '../../../../server/utils/match'

type NewPlacementForm = {
  newPlacementArrivalDate: string
  newPlacementDepartureDate: string
  newPlacementReason: TransferReason
  notes: string
}

export default class NewPlacementPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('New placement')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({ newPlacementArrivalDate, newPlacementDepartureDate, newPlacementReason, notes }: NewPlacementForm) {
    this.completeDatePicker('newPlacementArrivalDate', newPlacementArrivalDate)
    this.completeDatePicker('newPlacementDepartureDate', newPlacementDepartureDate)
    this.checkRadioByLabel(newPlacementReasons[newPlacementReason])
    this.completeTextArea('notes', notes)
  }

  shouldBePopulated({
    newPlacementArrivalDate,
    newPlacementDepartureDate,
    newPlacementReason,
    notes,
  }: NewPlacementForm) {
    this.datePickerShouldContainDate('newPlacementArrivalDate', newPlacementArrivalDate)
    this.datePickerShouldContainDate('newPlacementDepartureDate', newPlacementDepartureDate)
    this.verifyRadioByLabel(newPlacementReasons[newPlacementReason])
    this.verifyTextInputContentsById('notes', notes)
  }
}
