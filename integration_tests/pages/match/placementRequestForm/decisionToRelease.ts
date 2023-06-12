import Page from '../../page'

export default class DecisionToRelease extends Page {
  constructor() {
    super('Release details')
  }

  completeForm() {
    this.clearAndCompleteDateInputs('decisionToReleaseDate', '2023-08-01')
    this.clearAndCompleteTextInputById('informationFromDirectionToRelease', 'Some information')
  }
}
