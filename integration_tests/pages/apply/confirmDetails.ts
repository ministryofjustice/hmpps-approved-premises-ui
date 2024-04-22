import type { FullPerson } from '@approved-premises/api'

import Page from '../page'

export default class ConfirmDetailsPage extends Page {
  constructor(private person: FullPerson) {
    super(`Confirm ${person.name}'s details`)
  }

  verifyRestrictedPersonMessaging() {
    cy.get('p').contains('This person is a limited access offender (LAO).')
    cy.get('a').contains('Guidance on managing user access to LAOs is available on EQUIP.')
  }

  clickSaveAndContinue() {
    cy.get('a').contains('Save and continue').click()
  }
}
