import { Cas1PlacementRequestDetail, FullPerson, TransferReason } from '@approved-premises/api'
import Page from '../../page'
import { newPlacementReasons } from '../../../../server/utils/match'

type NewPlacementForm = {
  newPlacementArrivalDate: string
  newPlacementDepartureDate: string
  newPlacementReason: TransferReason
  newPlacementNotes: string
}

export default class NewPlacementPage extends Page {
  constructor(placementRequest: Cas1PlacementRequestDetail) {
    super('Placement transfer details')

    this.shouldShowKeyPersonDetails(placementRequest.person as FullPerson, placementRequest.risks.tier.value.level)
  }

  completeForm({
    newPlacementArrivalDate,
    newPlacementDepartureDate,
    newPlacementReason,
    newPlacementNotes,
  }: NewPlacementForm) {
    this.completeDatePicker('newPlacementArrivalDate', newPlacementArrivalDate)
    this.completeDatePicker('newPlacementDepartureDate', newPlacementDepartureDate)
    this.checkRadioByLabel(newPlacementReasons[newPlacementReason])
    this.completeTextArea('newPlacementNotes', newPlacementNotes)
  }

  shouldBePopulated({
    newPlacementArrivalDate,
    newPlacementDepartureDate,
    newPlacementReason,
    newPlacementNotes,
  }: NewPlacementForm) {
    this.datePickerShouldContainDate('newPlacementArrivalDate', newPlacementArrivalDate)
    this.datePickerShouldContainDate('newPlacementDepartureDate', newPlacementDepartureDate)
    this.verifyRadioByLabel(newPlacementReasons[newPlacementReason])
    this.verifyTextInputContentsById('newPlacementNotes', newPlacementNotes)
  }
}
