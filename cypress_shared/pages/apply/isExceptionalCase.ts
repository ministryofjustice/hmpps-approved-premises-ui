import Page from '../page'

export default class IsExceptionalCasePage extends Page {
  constructor() {
    super('This application is not eligible')
  }

  completeForm() {
    this.checkRadioByNameAndValue('isExceptionalCase', 'yes')
  }
}
