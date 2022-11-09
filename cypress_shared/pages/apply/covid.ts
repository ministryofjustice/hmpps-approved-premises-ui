import Page from '../page'

export default class CovidPage extends Page {
  constructor() {
    super('Healthcare information')
  }

  completeForm() {
    this.checkRadioByNameAndValue('fullyVaccinated', 'yes')
    this.checkRadioByNameAndValue('highRisk', 'yes')
    this.getTextInputByIdAndEnterDetails('additionalCovidInfo', 'additional info')
  }
}
