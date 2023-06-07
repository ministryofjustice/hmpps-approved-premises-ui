import Page from '../../page'

export default class AdditionalPlacementDetails extends Page {
  constructor() {
    super('Placement details')
  }

  completeForm() {
    this.clearAndCompleteDateInputs('arrivalDate', '2023-08-01')
    this.clearAndCompleteTextInputById('duration', '14')
    this.clearAndCompleteTextInputById('reason', 'Some reason')
  }
}
