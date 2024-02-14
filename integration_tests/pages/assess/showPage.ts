import type { ApprovedPremisesAssessment, FullPerson } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

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
      this.assertDefinition('NOMIS Number', person.nomsNumber)
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
    this.shouldShowCheckYourAnswersResponses(this.assessment)
  }
}
