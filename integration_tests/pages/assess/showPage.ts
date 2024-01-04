import type { ApprovedPremisesAssessment, FullPerson } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import { summaryListSections } from '../../../server/utils/applications/summaryListUtils'

import Page from '../page'

export default class ShowPage extends Page {
  constructor(private readonly assessment: ApprovedPremisesAssessment) {
    super('View Assessment')
  }

  shouldShowPersonInformation() {
    cy.get('[data-cy-section="person-details"]').within(() => {
      const { application } = this.assessment
      const person = this.assessment.application.person as FullPerson

      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMS Number', person.nomsNumber)
      this.assertDefinition('Nationality', person.nationality)
      this.assertDefinition('Religion or belief', person.religionOrBelief)
      this.assertDefinition('Sex', person.sex)

      cy.get(`[data-cy-status]`)
        .should('have.attr', 'data-cy-status')
        .and('equal', application.personStatusOnSubmission)
      this.assertDefinition('Prison', person.prisonName)
    })
  }

  shouldShowResponses() {
    const sections = summaryListSections(this.assessment, false)

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
