import type { Person, PrisonCaseNote } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'
import ApplyPage from './applyPage'

import Page from '../page'
import { Adjudication } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'

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

  shouldShowCaseNotes(caseNotes: Array<PrisonCaseNote>) {
    cy.get(`[data-cy-check-your-answers-section="prison-information"]`).within(() => {
      cy.get('dt')
        .contains('Selected prison case notes that support this application')
        .parent()
        .within(() => {
          cy.get('dl.govuk-summary-list--embedded').then($items => {
            cy.wrap($items).should('have.length', caseNotes.length)
            caseNotes.forEach((caseNote, i) => {
              cy.wrap($items[i]).within(() => {
                this.assertDefinition('Date created', DateFormats.isoDateToUIDate(caseNote.createdAt))
                this.assertDefinition('Date occurred', DateFormats.isoDateToUIDate(caseNote.occurredAt))
                this.assertDefinition('Is the case note sensitive?', caseNote.sensitive ? 'Yes' : 'No')
                this.assertDefinition('Name of author', caseNote.authorName)
                this.assertDefinition('Type', caseNote.type)
                this.assertDefinition('Subtype', caseNote.subType)
                this.assertDefinition('Note', caseNote.note)
              })
            })
          })
        })
    })
  }

  shouldShowAdjudications(adjudications: Array<Adjudication>) {
    cy.get(`[data-cy-check-your-answers-section="prison-information"]`).within(() => {
      cy.get('dt')
        .contains('Adjudications')
        .parent()
        .within(() => {
          cy.get('dl.govuk-summary-list--embedded').then($items => {
            cy.wrap($items).should('have.length', adjudications.length)
            adjudications.forEach((adjudication, i) => {
              cy.wrap($items[i]).within(() => {
                this.assertDefinition('Adjudication number', String(adjudication.id))
                this.assertDefinition(
                  'Report date and time',
                  DateFormats.isoDateTimeToUIDateTime(adjudication.reportedAt),
                )
                this.assertDefinition('Establishment', adjudication.establishment)
                this.assertDefinition('Offence description', adjudication.offenceDescription)
                this.assertDefinition('Finding', sentenceCase(String(adjudication.finding)))
              })
            })
          })
        })
    })
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
