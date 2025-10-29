import type {
  ApprovedPremisesApplication as Application,
  ApplicationTimelineNote,
  ApprovedPremisesApplicationStatus,
  FullPerson,
  RequestForPlacement,
  ApprovedPremisesAssessment,
} from '@approved-premises/api'
import { fromPartial } from '@total-typescript/shoehorn'
import { addYears } from 'date-fns'
import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'
import { ApplicationShowPageTab, applicationShowPageTab } from '../../../server/utils/applications/utils'
import paths from '../../../server/paths/apply'
import { mapRequestsForPlacementToSummaryCards } from '../../../server/utils/placementRequests'
import { SubmittedDocumentRenderer } from '../../../server/utils/forms/submittedDocumentRenderer'
import { applicationKeyDetails } from '../../../server/utils/applications/helpers'

export default class ShowPage extends Page {
  constructor(private readonly application: Application) {
    super('Approved Premises application')
    cy.get('h1').contains('Approved Premises application')
    this.shouldShowKeyDetails(applicationKeyDetails(application))
  }

  static visit(application: Application, tab?: ApplicationShowPageTab) {
    const path = `/applications/${application.id}`
    if (tab) {
      cy.visit(applicationShowPageTab(application.id, tab))
    } else {
      cy.visit(path)
    }

    return new ShowPage(application)
  }

  enterNote(note: ApplicationTimelineNote) {
    cy.get('textarea[name="note"]').type(note.note)
  }

  clickAddNote() {
    cy.get('button').contains('Add note').click()
  }

  clickAppealLink() {
    cy.get(`[data-cy-appeal-application="${this.application.id}"]`).click()
  }

  shouldHaveWithdrawalLink() {
    cy.get(`[data-cy-withdraw-application="${this.application.id}"]`).should(
      'have.attr',
      'href',
      paths.applications.withdraw.new({ id: this.application.id }),
    )
  }

  shouldNotShowCreatePlacementButton() {
    cy.contains('Create request for placement').should('not.exist')
  }

  shouldNotShowOfflineStatus() {
    cy.get('.govuk-tag').contains('Offline application').should('not.exist')
  }

  shouldShowOfflineStatus() {
    cy.get('.govuk-tag').contains('Offline application').should('exist')
  }

  shouldNotShowAssessmentDetails() {
    this.clickTab('Assessment')
    cy.contains('This application has not been assessed')
  }

  shouldShowAssessmentDetails(assessment: ApprovedPremisesAssessment) {
    this.clickTab('Assessment')
    const sections = new SubmittedDocumentRenderer(assessment).response

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

  shouldShowAssessedDate() {
    const accepted = this.application.assessmentDecision === 'accepted'
    const assessedDateText = `Assessed as ${accepted ? 'suitable' : 'not suitable'}: ${DateFormats.isoDateToUIDate(
      this.application.assessmentDecisionDate,
    )}`
    const expiryDateText = `Application expires on: ${DateFormats.dateObjtoUIDate(
      addYears(this.application.assessmentDecisionDate, 1),
    )}`

    cy.get('.govuk-inset-text').contains(assessedDateText).should('exist')
    if (this.application.assessmentDecision === 'accepted') {
      cy.get('.govuk-inset-text')
        .contains(expiryDateText)
        .should(accepted ? 'exist' : 'not.exist')
    }
  }

  shouldShowPersonInformation() {
    this.shouldShowPersonDetails(this.application.person as FullPerson, this.application.personStatusOnSubmission)
  }

  shouldShowApplication() {
    this.clickTab('Application')
    this.shouldShowResponseFromSubmittedApplication(this.application)
  }

  clickTimelineTab() {
    cy.get('.moj-sub-navigation a').contains('Timeline').click()
  }

  clickWithdraw(placementRequestId: string) {
    cy.get(`[data-cy-placement-application-id="${placementRequestId}"]`).within(() => {
      cy.get('a').contains('Withdraw').click()
    })
  }

  shouldShowRequestsForPlacement(
    requestsForPlacement: Array<RequestForPlacement>,
    application: Application,
    user?: { id: string },
  ) {
    mapRequestsForPlacementToSummaryCards(requestsForPlacement, application, fromPartial(user)).forEach(
      requestForPlacementSummaryCard => {
        cy.get(
          `[data-cy-placement-application-id="${requestForPlacementSummaryCard.card.attributes['data-cy-placement-application-id']}"]`,
        )
          .should('contain', requestForPlacementSummaryCard.card.title.text)
          .within(() => {
            this.shouldContainSummaryListItems(requestForPlacementSummaryCard.rows)
          })
      },
    )
  }

  showsNoteAddedConfirmationMessage() {
    this.shouldShowBanner('Note added')
  }

  shouldShowStatusTag(status: ApprovedPremisesApplicationStatus) {
    cy.get(`.govuk-tag[data-cy-status="${status}"]`).should('exist')
  }

  shouldContainPlacementRequestTab() {
    cy.get('a').contains('Placement requests')
  }
}
