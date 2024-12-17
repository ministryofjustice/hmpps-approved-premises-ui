import type {
  ApprovedPremisesAssessment as Assessment,
  Document,
  FullPerson,
  PersonRisks,
  PrisonCaseNote,
} from '@approved-premises/api'
import { DateFormats } from '../../../server/utils/dateUtils'

import { Adjudication, PersonAcctAlert } from '../../../server/@types/shared'
import { mapApiPersonRisksForUi, sentenceCase } from '../../../server/utils/utils'
import AssessPage from './assessPage'

import RiskInformationPage from './riskInformationPage'
import { OasysSummariesSection } from '../../../server/@types/ui'

export default class ReviewPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Review application', assessment, 'review-application', 'review')
  }

  shouldShowDocuments(selectedDocuments: Array<Document>) {
    cy.get(`[data-cy-section="attach-required-documents"]`).within(() => {
      selectedDocuments.forEach(d => {
        this.assertDefinition(d.fileName, d.description)
      })
    })
  }

  shouldShowCaseNotes(caseNotes: Array<PrisonCaseNote>) {
    cy.get(`[data-cy-section="prison-information"]`).within(() => {
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
    cy.get(`[data-cy-section="prison-information"]`).within(() => {
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

  riskInformationPage(oasysSections: Record<string, OasysSummariesSection>, risks: PersonRisks) {
    const {
      'offence-details': offenceDetails,
      'rosh-summary': roshSummary,
      'supporting-information': supportingInformation,
      'risk-to-self': riskToSelf,
      'risk-management-plan': riskManagementPlan,
    } = oasysSections

    cy.get('a').contains('View detailed risk information').click()

    const riskInformationPage = new RiskInformationPage()
    riskInformationPage.showsRiskInformation({
      offenceDetails,
      roshSummary,
      supportingInformation,
      riskToSelf,
      riskManagementPlan,
    })
    riskInformationPage.shouldShowRiskWidgets(mapApiPersonRisksForUi(risks))
    riskInformationPage.clickBack()
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
    this.shouldShowPersonDetails(
      assessment.application.person as FullPerson,
      assessment.application.personStatusOnSubmission,
    )
    this.shouldShowDocuments(
      assessment.application.data?.['attach-required-documents']['attach-documents'].selectedDocuments,
    )
    this.shouldShowCaseNotes(assessment.application.data?.['prison-information']['case-notes'].selectedCaseNotes)
    this.shouldShowAdjudications(assessment.application.data?.['prison-information']['case-notes'].adjudications)
    this.riskInformationPage(assessment.application.data?.['oasys-import'], assessment.application.risks)
    this.prisonInformationPage(
      assessment.application.data?.['prison-information']['case-notes'].adjudications,
      assessment.application.data?.['prison-information']['case-notes'].selectedCaseNotes,
      assessment.application.data?.['prison-information']['case-notes'].acctAlerts,
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('reviewed')
  }
}
