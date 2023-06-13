import Page from '../../page'

export default class AdditionalPlacementDetails extends Page {
  constructor() {
    super('Placement details')
  }

  completeForm() {
    this.clearAndCompleteDateInputs('arrivalDate', '2023-08-01')
    this.clearAndCompleteTextInputById('durationWeeks', '12')
    this.clearAndCompleteTextInputById('durationDays', '5')
    this.clearAndCompleteTextInputById('reason', 'Some reason')
  }
}
