import type { ApprovedPremisesAssessment } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import { summaryListSections } from '../../../server/utils/applications/summaryListUtils'

import Page from '../page'

export default class ShowPage extends Page {
  constructor(private readonly asssessment: ApprovedPremisesAssessment) {
    super('View Assessment')
  }

  shouldShowPersonInformation() {
    cy.get('[data-cy-section="person-details"]').within(() => {
      this.assertDefinition('Name', this.asssessment.application.person.name)
      this.assertDefinition('CRN', this.asssessment.application.person.crn)
      this.assertDefinition(
        'Date of Birth',
        DateFormats.isoDateToUIDate(this.asssessment.application.person.dateOfBirth, { format: 'short' }),
      )
      this.assertDefinition('NOMS Number', this.asssessment.application.person.nomsNumber)
      this.assertDefinition('Nationality', this.asssessment.application.person.nationality)
      this.assertDefinition('Religion or belief', this.asssessment.application.person.religionOrBelief)
      this.assertDefinition('Sex', this.asssessment.application.person.sex)

      cy.get(`[data-cy-status]`)
        .should('have.attr', 'data-cy-status')
        .and('equal', this.asssessment.application.person.status)
      this.assertDefinition('Prison', this.asssessment.application.person.prisonName)
    })
  }

  shouldShowResponses() {
    const sections = summaryListSections(this.asssessment, false)

    sections.forEach(section => {
      cy.get('h2.govuk-heading-l').contains(section.title).should('exist')
      section.tasks.forEach(task => {
        cy.get(`[data-cy-section="${task.card.attributes['data-cy-section']}"]`).within(() => {
          cy.get('.govuk-summary-card__title').contains(task.card.title.text).should('exist')
          task.rows.forEach(item => {
            const key = 'text' in item.key ? item.key.text : item.key.html
            const value = 'text' in item.value ? item.value.text : item.value.html
            this.assertDefinition(key, value)
          })
        })
      })
    })
  }
}
