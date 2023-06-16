import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import { summaryListSections } from '../../../server/utils/applications/summaryListUtils'

import Page from '../page'

export default class ShowPage extends Page {
  constructor(private readonly application: ApprovedPremisesApplication) {
    super('View Application')
  }

  static visit(application: ApprovedPremisesApplication) {
    cy.visit(`/applications/${application.id}`)
    return new ShowPage(application)
  }

  shouldNotShowCreatePlacementButton() {
    cy.get('Create placement request').should('not.exist')
  }

  shouldShowPersonInformation() {
    cy.get('[data-cy-section="person-details"]').within(() => {
      this.assertDefinition('Name', this.application.person.name)
      this.assertDefinition('CRN', this.application.person.crn)
      this.assertDefinition(
        'Date of Birth',
        DateFormats.isoDateToUIDate(this.application.person.dateOfBirth, { format: 'short' }),
      )
      this.assertDefinition('NOMS Number', this.application.person.nomsNumber)
      this.assertDefinition('Nationality', this.application.person.nationality)
      this.assertDefinition('Religion or belief', this.application.person.religionOrBelief)
      this.assertDefinition('Sex', this.application.person.sex)

      cy.get(`[data-cy-status]`).should('have.attr', 'data-cy-status').and('equal', this.application.person.status)
      this.assertDefinition('Prison', this.application.person.prisonName)
    })
  }

  shouldShowResponses() {
    const sections = summaryListSections(this.application, false)

    sections.forEach(section => {
      cy.get('h2.govuk-heading-l').contains(section.title).should('exist')
      section.tasks.forEach(task => {
        cy.get(`[data-cy-section="${task.card.attributes['data-cy-section']}"]`).within(() => {
          cy.get('.govuk-summary-card__title').contains(task.card.title.text).should('exist')
          this.shouldContainSummaryListItems(task.rows)
        })
      })
    })
  }
}
