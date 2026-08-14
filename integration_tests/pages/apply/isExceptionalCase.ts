import { YesOrNo } from '@approved-premises/ui'
import { Cas1Application } from '@approved-premises/api'
import Page from '../page'
import { displayName } from '../../../server/utils/personUtils'

export default class IsExceptionalCasePage extends Page {
  constructor(application: Cas1Application) {
    super(`${displayName(application.person)} is not normally eligible for an AP placement`)
  }

  showsTierNotFoundMessage() {
    cy.get('h2').should('contain', "We cannot find this person's tier")
  }

  completeForm(answer: YesOrNo) {
    this.checkRadioByNameAndValue('isExceptionalCase', answer)
  }
}
