import type {
  ApprovedPremisesApplication as Application,
  ApplicationTimelineNote,
  ApprovedPremisesApplicationStatus,
  FullPerson,
  RequestForPlacement,
} from '@approved-premises/api'
import { fromPartial } from '@total-typescript/shoehorn'

import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'
import { ApplicationShowPageTab, applicationShowPageTab } from '../../../server/utils/applications/utils'
import paths from '../../../server/paths/apply'
import { displayName } from '../../../server/utils/personUtils'
import { mapRequestsForPlacementToSummaryCards } from '../../../server/utils/placementRequests'

export default class ShowPage extends Page {
  constructor(private readonly application: Application) {
    super('Approved Premises application')
    cy.get('h2').contains(displayName(application.person))
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

  clickCreatePlacementButton() {
    cy.get('button').contains('Create request for placement').click()
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

  shouldShowAssessmentDetails(expired = false) {
    cy.get('.govuk-inset-text')
      .contains(
        `Application was ${this.application.assessmentDecision} on ${DateFormats.isoDateToUIDate(
          this.application.assessmentDecisionDate,
        )}.`,
      )
      .should('exist')

    if (expired) {
      cy.get('.govuk-inset-text')
        .contains(
          'Applications expire 12 months after being assessed as suitable. You cannot submit any new requests for placement.',
        )
        .should('exist')
      cy.get('.govuk-inset-text')
        .contains('You’ll need to submit a new application for this person to be assessed.')
        .should('exist')
    } else {
      cy.get('.govuk-inset-text')
        .contains(
          'Applications expire 12 months after being assessed as ‘suitable’. You’ll then need to submit a new application for this person to be assessed.',
        )
        .should('exist')
      cy.get('.govuk-inset-text').contains('Booked placements are unaffected.').should('exist')
    }

    cy.get(`a[data-cy-assessmentId="${this.application.assessmentId}"]`).should('exist')
  }

  shouldShowPersonInformation() {
    this.shouldShowPersonDetails(this.application.person as FullPerson, this.application.personStatusOnSubmission)
  }

  shouldShowResponses() {
    this.shouldShowResponseFromSubmittedApplication(this.application)
  }

  shouldShowResponsesForUnsubmittedWithdrawnApplication() {
    this.shouldShowCheckYourAnswersResponses(this.application)
  }

  clickTimelineTab() {
    cy.get('.moj-sub-navigation a').contains('Timeline').click()
  }

  clickRequestAPlacementTab() {
    cy.get('a').contains('Request for placement').click()
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
      (requestForPlacementSummaryCard, i) => {
        cy.get(
          `[data-cy-placement-application-id="${requestForPlacementSummaryCard.card.attributes['data-cy-placement-application-id']}"]`,
        )
          .should('contain', requestForPlacementSummaryCard.card.title.text)
          .within(() => {
            cy.get('.govuk-summary-list__row').should(
              'have.length',
              // all of the top level rows + 2 rows for each placement date
              requestForPlacementSummaryCard.rows.length + requestsForPlacement[i].placementDates.length * 2,
            )
            this.shouldContainSummaryListItems(requestForPlacementSummaryCard.rows)
          })
      },
    )
  }

  showsWithdrawalConfirmationMessage() {
    this.shouldShowBanner('Request for placement for ', { exact: false })
  }

  showsNoteAddedConfirmationMessage() {
    this.shouldShowBanner('Note added')
  }

  shouldShowStatusTag(status: ApprovedPremisesApplicationStatus) {
    cy.get(`.govuk-tag[data-cy-status="${status}"]`).should('exist')
  }
}
