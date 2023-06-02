import Page from '../../page'

export default class PreviousRotlPlacement extends Page {
  constructor() {
    super('Request for placement')
  }

  completeForm() {
    this.checkRadioByNameAndValue('previousRotlPlacement', 'yes')
    this.getTextInputByIdAndClear('lastAp')
    this.clearAndCompleteTextInputById('lastAp', 'Some Manager')
    this.clearAndCompleteDateInputs('lastPlacementDate', '2023-07-01')
    this.clearAndCompleteTextInputById('details', 'Some Summary Text')
  }
}
