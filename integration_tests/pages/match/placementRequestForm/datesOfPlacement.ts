import Page from '../../page'

export default class DatesOfPlacement extends Page {
  constructor() {
    super('Dates of placement')
  }

  completeForm() {
    this.clearAndCompleteDateInputs('arrivalDate', '2023-08-01')
    this.clearAndCompleteTextInputById('durationWeeks', '12')
    this.clearAndCompleteTextInputById('durationDays', '5')
  }
}
