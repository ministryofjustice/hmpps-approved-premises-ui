import type { Person } from '@approved-premises/api'

import Page from '../page'
import paths from '../../../server/paths/apply'

export default class Cas2Option extends Page {
  constructor(readonly person: Person) {
    super('About Short-term accommodation (CAS2)')
  }

  public checkContent(): void {
    cy.contains('a mandatory structured accommodation and support package')
    cy.contains(
      "CAS1's enhanced level of on-site supervision is designed to address a serious and imminent risk of harm to themselves or others on release",
    )
    this.shouldShowLink(
      'Apply for Short-term accommodation (CAS2)',
      'https://community-accommodation-tier-2-bail-dev.hmpps.service.justice.gov.uk/new-cohorts/applications/before-you-start',
    )
    this.shouldHaveBackLink(paths.applications.people.eligibilityCheck({ crn: this.person.crn }))
  }
}
