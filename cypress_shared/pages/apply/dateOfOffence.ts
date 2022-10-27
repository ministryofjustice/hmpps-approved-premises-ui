import Page from '../page'

export default class DateOfOffence extends Page {
  constructor() {
    super('Convicted offences')
  }

  completeForm(): void {
    this.checkCheckboxByNameAndValue('arsonOffence', 'current')
    this.checkCheckboxByNameAndValue('hateCrime', 'previous')
    this.checkCheckboxByNameAndValue('inPersonSexualOffence', 'previous')
    this.checkCheckboxByNameAndValue('inPersonSexualOffence', 'current')
  }
}
