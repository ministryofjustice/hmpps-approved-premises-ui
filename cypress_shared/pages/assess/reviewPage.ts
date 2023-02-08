import type { Person, PrisonCaseNote, Document, ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import { Adjudication, PersonAcctAlert } from '../../../server/@types/shared'
import { sentenceCase } from '../../../server/utils/utils'
import AssessPage from './assessPage'

import Review from '../../../server/form-pages/assess/reviewApplication/reviewApplicationAndDocuments/review'

export default class ReviewPage extends AssessPage {
  constructor(assessment: Assessment) {
    super(assessment, 'Review application')
    this.pageClass = new Review({ reviewed: 'yes' }, assessment)
  }

  shouldShowPersonInformation(person: Person) {
    cy.get('[data-cy-review-section="person-details"]').within(() => {
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

  shouldShowDocuments(selectedDocuments: Array<Document>) {
    cy.get(`[data-cy-review-section="attach-required-documents"]`).within(() => {
      selectedDocuments.forEach(d => {
        this.assertDefinition(d.fileName, d.description)
      })
    })
  }

  shouldShowCaseNotes(caseNotes: Array<PrisonCaseNote>) {
    cy.get(`[data-cy-review-section="prison-information"]`).within(() => {
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
    cy.get(`[data-cy-review-section="prison-information"]`).within(() => {
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

  prisonInformationPage(
    adjudications: Array<Adjudication>,
    prisonCaseNotes: Array<PrisonCaseNote>,
    acctAlerts: Array<PersonAcctAlert>,
  ) {
    cy.get('a').contains('View additional prison information').click()

    this.shouldDisplayPrisonCaseNotes(prisonCaseNotes)
    this.shouldDisplayAdjudications(adjudications)
    this.shouldDisplayAcctAlerts(acctAlerts)

    this.clickBack()
  }

  shouldShowAnswers(assessment: Assessment) {
    this.shouldShowPersonInformation(assessment.application.person)

    this.shouldShowDocuments(
      assessment.application.data?.['attach-required-documents']['attach-documents'].selectedDocuments,
    )

    this.shouldShowCaseNotes(assessment.application.data?.['prison-information']['case-notes'].selectedCaseNotes)
    this.shouldShowAdjudications(assessment.application.data?.['prison-information']['case-notes'].adjudications)
    this.prisonInformationPage(
      assessment.application.data?.['prison-information']['case-notes'].adjudications,
      assessment.application.data?.['prison-information']['case-notes'].selectedCaseNotes,
      assessment.application.data?.['prison-information']['case-notes'].acctAlerts,
    )
  }

  completeForm() {
    this.checkRadioByNameAndValue('reviewed', this.pageClass.body.reviewed as string)
  }
}
