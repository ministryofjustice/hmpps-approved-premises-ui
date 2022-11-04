import Page from '../page'

export default class PlacementPurposePage extends Page {
  constructor() {
    super('What is the purpose of the Approved Premises (AP) placement?')
  }

  completeForm() {
    this.checkCheckboxByNameAndValue('placementPurposes', 'drugAlcoholSupport')
    this.checkCheckboxByNameAndValue('placementPurposes', 'otherReason')
    this.getTextInputByIdAndEnterDetails('otherReason', 'Reason')
  }
}
