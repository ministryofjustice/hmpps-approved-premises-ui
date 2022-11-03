import Page from '../page'

export default class DescribeLocationFactors extends Page {
  constructor() {
    super('Location factors')
  }

  completeForm(): void {
    this.getTextInputByIdAndEnterDetails('postcodeArea', 'SW1')
    this.getTextInputByIdAndEnterDetails('positiveFactors', 'Some positive factors')
    this.checkRadioByNameAndValue('restrictions', 'yes')
    this.getTextInputByIdAndEnterDetails('restrictionDetail', 'Restrictions go here')
    this.checkRadioByNameAndValue('alternativeRadiusAccepted', 'yes')
    this.getSelectInputByIdAndSelectAnEntry('alternativeRadius', '70')
    this.checkRadioByNameAndValue('differentPDU', 'no')
  }
}
