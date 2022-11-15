import type { Person } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'
import ApplyPage from './applyPage'

import Page from '../page'

export default class CheckYourAnswersPage extends Page {
  constructor() {
    super('Check your answers')
  }

  shouldShowPersonInformation(person: Person) {
    cy.get('[data-cy-check-your-answers-section="person-details"]').within(() => {
      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMS Number', person.nomsNumber)
      this.assertDefinition('Nationality', person.nationality)
      this.assertDefinition('Religion or Belief', person.religionOrBelief)
      this.assertDefinition('Sex', person.sex)

      cy.get(`[data-cy-status]`).should('have.attr', 'data-cy-status').and('equal', person.status)
      this.assertDefinition('Prison', person.prisonName)
    })
  }

  shouldShowBasicInformationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('basic-information', pages)
  }

  shouldShowTypeOfApAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('type-of-ap', pages)
  }

  shouldShowRiskManagementAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('risk-management-features', pages)
  }

  shouldShowAccessAndHealthcareAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('access-and-healthcare', pages)
  }

  shouldShowLocationFactorsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('location-factors', pages)
  }

  shouldShowFurtherConsiderationsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('further-considerations', pages)
  }

  shouldShowMoveOnAnswers(pages: Array<ApplyPage>) {
    this.shouldShowAnswersForTask('move-on', pages)
  }

  private shouldShowAnswersForTask(taskName: string, pages: Array<ApplyPage>) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          this.assertDefinition(key, responses[key] as string)
        })
      })
    })
  }
}
