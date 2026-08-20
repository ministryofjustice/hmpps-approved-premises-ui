import { Cas1Application } from '@approved-premises/api'
import Page from '../page'
import { displayName } from '../../../server/utils/personUtils'

export default class NotEligiblePage extends Page {
  constructor(application: Cas1Application) {
    super(`${displayName(application.person)} is not eligible for an AP placement`)
    cy.title().should(
      'eq',
      `Approved Premises - ${displayName(application.person)} is not eligible for an AP placement`,
    )
  }
}
