import { YesOrNo } from '@approved-premises/ui'
import Page from '../page'

export default class IsExceptionalCasePage extends Page {
  constructor() {
    super('This application is not eligible')
  }

  showsTierNotFoundMessage() {
    cy.get('h2').should('contain', "We cannot find this person's tier")
  }

  completeForm(answer: YesOrNo) {
    this.checkRadioByNameAndValue('isExceptionalCase', answer)
  }
}
