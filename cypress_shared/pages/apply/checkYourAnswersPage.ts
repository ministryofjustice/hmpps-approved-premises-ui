import type { Person, PrisonCaseNote, Document, ApprovedPremisesApplication } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'
import ApplyPage from './applyPage'

import { Adjudication } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'
import paths from '../../../server/paths/apply'

export default class CheckYourAnswersPage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Check your answers',
      application,
      'check-your-answers',
      'review',
      paths.applications.show({ id: application.id }),
    )
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
    this.shouldShowTitle('basic-information', 'Basic Information')
    this.shouldShowAnswersForTask('basic-information', pages)
  }

  shouldShowTypeOfApAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('type-of-ap', 'Type of AP required')
    this.shouldShowAnswersForTask('type-of-ap', pages)
  }

  shouldShowOptionalOasysSectionsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('oasys-import', 'Choose sections of OASys to import')
    this.shouldShowAnswersForTask('oasys-import', pages)
  }

  shouldShowRiskManagementAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('risk-management-features', 'Add detail about managing risks and needs')
    this.shouldShowAnswersForTask('risk-management-features', pages)
  }

  shouldShowAccessAndHealthcareAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('access-and-healthcare', 'Add access, cultural and healthcare needs')
    this.shouldShowAnswersForTask('access-and-healthcare', pages)
  }

  shouldShowLocationFactorsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('location-factors', 'Describe location factors')
    this.shouldShowAnswersForTask('location-factors', pages)
  }

  shouldShowFurtherConsiderationsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('further-considerations', 'Detail further considerations for placement')
    this.shouldShowAnswersForTask('further-considerations', pages)
  }

  shouldShowMoveOnAnswers(pages: Array<ApplyPage>) {
    this.shouldShowTitle('move-on', 'Add move on information')
    this.shouldShowAnswersForTask('move-on', pages)
  }

  shouldShowDocuments(selectedDocuments: Array<Document>) {
    this.shouldShowTitle('attach-required-documents', 'Attach required documents')
    cy.get(`[data-cy-check-your-answers-section="attach-required-documents"]`).within(() => {
      selectedDocuments.forEach(d => {
        this.assertDefinition(d.fileName, d.description)
      })
    })
  }

  shouldShowCaseNotes(caseNotes: Array<PrisonCaseNote>) {
    this.shouldShowTitle('prison-information', 'Review prison information')
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

  private shouldShowTitle(taskName: string, taskTitle: string) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      cy.get('.box-title').should('contain', taskTitle)
    })
  }
}
