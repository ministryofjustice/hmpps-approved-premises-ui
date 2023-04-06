import Page from '../page'

export default class EsapExceptionalCase extends Page {
  constructor() {
    super(
      'Has there been agreement with the Community Head of Public Protection that an application should be made as an exceptional case?',
    )
  }

  completeForm() {
    this.checkRadioByNameAndValue('agreedCaseWithCommunityHopp', 'yes')
    this.getTextInputByIdAndEnterDetails('communityHoppName', 'Some Manager')
    this.completeDateInputs('agreementDate', '2023-07-01')
    this.completeTextArea('agreementSummary', 'Some Summary Text')
  }
}
