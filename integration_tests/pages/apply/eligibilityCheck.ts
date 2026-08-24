import type { FullPerson } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import Page from '../page'

export default class Cas2Eligibility extends Page {
  constructor(person: FullPerson) {
    const title =
      person.tier.tierScore === 'MISSING'
        ? 'You cannot continue with this application'
        : `${person.name} may be eligible for Short-term accommodation (CAS2)`
    super(title)
  }

  public checkContent(): void {
    cy.contains(
      'If they can be safely managed in other types of accommodation, they will be rejected for Approved Premises. Reasons for rejection include:',
    )
    this.shouldHaveBackLink(paths.applications.new({}))
  }

  checkDashboardLink(): void {
    this.shouldShowLink('Go to dashboard', paths.applications.dashboard({}))
  }
}
