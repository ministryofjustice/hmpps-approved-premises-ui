import Page from '../../page'

export default class UpdatesToApplication extends Page {
  constructor() {
    super('Updates to application')
  }

  completeForm() {
    this.checkRadioByNameAndValue('significantEvents', 'yes')
    this.clearAndCompleteTextInputById('significantEventsDetail', 'Some details about significant events')

    this.checkRadioByNameAndValue('changedCirumstances', 'yes')
    this.clearAndCompleteTextInputById('changedCirumstancesDetail', 'Some details about changed circumstances')

    this.checkRadioByNameAndValue('riskFactors', 'yes')
    this.clearAndCompleteTextInputById('riskFactorsDetail', 'Some details about risk factors')

    this.checkRadioByNameAndValue('accessOrHealthcareNeeds', 'yes')
    this.clearAndCompleteTextInputById('accessOrHealthcareNeedsDetail', 'Some details about access or healthcare needs')

    this.checkRadioByNameAndValue('locationFactors', 'yes')
    this.clearAndCompleteTextInputById('locationFactorsDetail', 'Some details about location factors')
  }
}
