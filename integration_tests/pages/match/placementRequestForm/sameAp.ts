import Page from '../../page'

export default class SameAp extends Page {
  constructor() {
    super('Request for placement')
  }

  completeForm() {
    this.checkRadioByNameAndValue('sameAp', 'yes')
  }
}
