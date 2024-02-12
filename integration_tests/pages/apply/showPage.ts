import type {
  ApprovedPremisesApplication as Application,
  ApplicationTimelineNote,
  FullPerson,
  PlacementApplication,
  TimelineEvent,
} from '@approved-premises/api'
import { fromPartial } from '@total-typescript/shoehorn'
import { DateFormats } from '../../../server/utils/dateUtils'

import Page from '../page'
import {
  ApplicationShowPageTab,
  applicationShowPageTab,
  eventTypeTranslations,
  mapPlacementApplicationToSummaryCards,
} from '../../../server/utils/applications/utils'
import { TextItem } from '../../../server/@types/ui'
import paths from '../../../server/paths/apply'

export default class ShowPage extends Page {
  constructor(private readonly application: Application) {
    super((application.person as FullPerson).name)
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

  clickActions() {
    cy.get('.moj-button-menu > .govuk-button').click()
  }

  clickAppealLink() {
    cy.get(`[data-cy-appeal-application="${this.application.id}"]`).click()
  }

  shouldHaveWithdrawalLink() {
    cy.get(`[data-cy-withdraw-application="${this.application.id}"]`).should(
      'have.attr',
      'href',
      paths.applications.withdrawables.show({ id: this.application.id }),
    )
  }

  clickCreatePlacementButton() {
    cy.get('button').contains('Create placement request').click()
  }

  shouldNotShowCreatePlacementButton() {
    cy.get('Create placement request').should('not.exist')
  }

  shouldNotShowOfflineStatus() {
    cy.get('.govuk-tag').contains('Offline application').should('not.exist')
  }

  shouldShowOfflineStatus() {
    cy.get('.govuk-tag').contains('Offline application').should('exist')
  }

  shouldShowAssessmentDetails() {
    cy.get('.govuk-inset-text')
      .contains(
        `Application was ${this.application.assessmentDecision} on ${DateFormats.isoDateToUIDate(
          this.application.assessmentDecisionDate,
        )}`,
      )
      .should('exist')

    cy.get(`a[data-cy-assessmentId="${this.application.assessmentId}"]`).should('exist')
  }

  shouldShowPersonInformation() {
    cy.get('[data-cy-section="person-details"]').within(() => {
      const person = this.application.person as FullPerson

      this.assertDefinition('Name', person.name)
      this.assertDefinition('CRN', person.crn)
      this.assertDefinition('Date of Birth', DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }))
      this.assertDefinition('NOMS Number', person.nomsNumber)
      this.assertDefinition('Nationality', person.nationality)
      this.assertDefinition('Religion or belief', person.religionOrBelief)
      this.assertDefinition('Sex', person.sex)

      cy.get(`[data-cy-status]`)
        .should('have.attr', 'data-cy-status')
        .and('equal', this.application.personStatusOnSubmission)
      this.assertDefinition('Prison', person.prisonName)
    })
  }

  shouldShowResponses() {
    this.shouldShowCheckYourAnswersResponses(this.application)
  }

  clickTimelineTab() {
    cy.get('a').contains('Timeline').click()
  }

  clickRequestAPlacementTab() {
    cy.get('a').contains('Request for placement').click()
  }

  clickWithdraw(placementRequestId: string) {
    cy.get(`[data-cy-placement-application-id="${placementRequestId}"]`).within(() => {
      cy.get('a').contains('Withdraw').click()
    })
  }

  verifyOnTimelineTab() {
    cy.get('a').contains('Placement').should('contain', '[aria-page="current"]')
  }

  shouldShowTimeline(timelineEvents: Array<TimelineEvent>) {
    const sortedTimelineEvents = timelineEvents.sort((a, b) => {
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    })

    cy.get('h2').contains('Application history').should('exist')
    cy.get('.moj-timeline').within(() => {
      cy.get('.moj-timeline__item').should('have.length', timelineEvents.length)

      cy.get('.moj-timeline__item').each(($el, index) => {
        cy.wrap($el).within(() => {
          cy.get('.moj-timeline__header').should('contain', eventTypeTranslations[sortedTimelineEvents[index].type])
          cy.get('time').should('have.attr', { time: sortedTimelineEvents[index].occurredAt })
          if (timelineEvents[index].createdBy?.name) {
            cy.get('.moj-timeline__header > .moj-timeline__byline').should(
              'contain',
              timelineEvents[index].createdBy.name,
            )
          }
          cy.get('.govuk-link').should('have.attr', { time: timelineEvents[index].associatedUrls[0].url })
          cy.get('.govuk-link').should('contain', timelineEvents[index].associatedUrls[0].type)
          cy.get('time').should('contain', DateFormats.isoDateTimeToUIDateTime(timelineEvents[index].occurredAt))
        })
      })
    })
  }

  shouldShowPlacementApplications(
    placementApplications: Array<PlacementApplication>,
    application: Application,
    user?: { id: string },
  ) {
    mapPlacementApplicationToSummaryCards(placementApplications, application, fromPartial(user)).forEach(
      placementApplicationSummaryCard => {
        cy.get(
          `[data-cy-placement-application-id="${placementApplicationSummaryCard.card.attributes['data-cy-placement-application-id']}"]`,
        )
          .should('contain', placementApplicationSummaryCard.card.title.text)
          .within(() => {
            cy.get('.govuk-summary-list__row').should('have.length', placementApplicationSummaryCard.rows.length)
            cy.get('.govuk-summary-list__row').each(($el, index) => {
              cy.wrap($el).within(() => {
                cy.get('.govuk-summary-list__key').should(
                  'contain',
                  (placementApplicationSummaryCard.rows[index].key as TextItem).text,
                )
                cy.get('.govuk-summary-list__value').should(
                  'contain',
                  (placementApplicationSummaryCard.rows[index].value as TextItem).text,
                )
              })
            })
          })
      },
    )
  }

  showsWithdrawalConfirmationMessage() {
    this.shouldShowBanner('Placement application withdrawn')
  }

  showsNoteAddedConfirmationMessage() {
    this.shouldShowBanner('Note added')
  }
}
