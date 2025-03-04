import type { ApprovedPremisesApplication, Document, PersonAcctAlert, PrisonCaseNote } from '@approved-premises/api'
import { PartnerAgencyDetails } from '../../../server/@types/ui'
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

  shouldShowBasicInformationAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('basic-information', 'Basic Information')
    this.shouldShowAnswersForTask('basic-information', pages)
  }

  shouldShowTypeOfApAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('type-of-ap', 'Type of AP required')
    this.shouldShowAnswersForTask('type-of-ap', pages)
  }

  shouldShowOptionalOasysSectionsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('oasys-import', 'Choose sections of OASys to import')
    this.shouldShowAnswersForTask('oasys-import', pages)
  }

  shouldShowRiskManagementAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('risk-management-features', 'Add detail about managing risks and needs')
    this.shouldShowAnswersForTask('risk-management-features', pages)
  }

  shouldShowAccessAndHealthcareAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('access-and-healthcare', 'Add access, cultural and healthcare needs')
    this.shouldShowAnswersForTask('access-and-healthcare', pages)
  }

  shouldShowLocationFactorsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('location-factors', 'Describe location factors')
    this.shouldShowAnswersForTask('location-factors', pages)
  }

  shouldShowFurtherConsiderationsAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('further-considerations', 'Detail further considerations for placement')
    this.shouldShowAnswersForTask('further-considerations', pages)
  }

  shouldShowContingencyPlanPartners(contingencyPlanPartners: Array<PartnerAgencyDetails>) {
    cy.get(`[data-cy-section="further-considerations"]`).within(() => {
      cy.get('dt')
        .contains('Contingency plan partners')
        .parent()
        .within(() => {
          cy.get('dl.govuk-summary-list--embedded').then($items => {
            cy.wrap($items).should('have.length', contingencyPlanPartners.length)
            contingencyPlanPartners.forEach((partner, i) => {
              cy.wrap($items[i]).within(() => {
                this.assertDefinition('Named contact', partner.namedContact)
                this.assertDefinition('Partner agency name', partner.partnerAgencyName)
                this.assertDefinition('Phone number', partner.phoneNumber)
                this.assertDefinition('Role in plan', partner.roleInPlan)
              })
            })
          })
        })
    })
  }

  shouldShowMoveOnAnswers(pages: Array<ApplyPage>) {
    this.shouldShowCheckYourAnswersTitle('move-on', 'Add move on information')
    this.shouldShowAnswersForTask('move-on', pages)
  }

  shouldShowDocuments(selectedDocuments: Array<Document>) {
    this.shouldShowCheckYourAnswersTitle('attach-required-documents', 'Attach required documents')
    cy.get(`[data-cy-section="attach-required-documents"]`).within(() => {
      selectedDocuments.forEach(d => {
        this.assertDefinition(d.fileName, d.description)
      })
    })
  }

  shouldShowCaseNotes(caseNotes: Array<PrisonCaseNote>) {
    this.shouldShowCheckYourAnswersTitle('prison-information', 'Review prison information')
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

  shouldShowAcctAlerts(acctAlerts: Array<PersonAcctAlert>) {
    cy.get(`[data-cy-section="prison-information"]`).within(() => {
      cy.get('dt')
        .contains('ACCT Alerts')
        .parent()
        .within(() => {
          cy.get('dl.govuk-summary-list--embedded').then($items => {
            cy.wrap($items).should('have.length', acctAlerts.length)
            acctAlerts.forEach((acctAlert, i) => {
              cy.wrap($items[i]).within(() => {
                this.assertDefinition('Alert type', String(acctAlert.alertTypeDescription))
                this.assertDefinition('ACCT description', acctAlert.description)
                this.assertDefinition('Date created', DateFormats.isoDateToUIDate(acctAlert.dateCreated))
                this.assertDefinition('Expiry date', DateFormats.isoDateToUIDate(acctAlert.dateExpires))
              })
            })
          })
        })
    })
  }

  private shouldShowAnswersForTask(taskName: string, pages: Array<ApplyPage>) {
    cy.get(`[data-cy-section="${taskName}"]`).within(() => {
      pages.forEach(page => {
        const responses = page.tasklistPage.response()
        Object.keys(responses).forEach(key => {
          this.assertDefinition(key, responses[key] as string)
        })
      })
    })
  }
}
