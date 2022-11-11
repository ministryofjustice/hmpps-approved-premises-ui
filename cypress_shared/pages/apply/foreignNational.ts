import Page from '../page'

export default class ForeignNationalPage extends Page {
  constructor() {
    super('Placement duration and move on')
  }

  completeForm() {
    this.checkRadioByNameAndValue('response', 'yes')
    this.completeDateInputs('date', new Date().toISOString())
  }
}
