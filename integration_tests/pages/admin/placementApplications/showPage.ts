import { ApprovedPremises, PlacementRequestDetail } from '@approved-premises/api'
import Page from '../../page'

import { bookingSummaryList } from '../../../../server/utils/bookings'
import { placementRequestSummaryList } from '../../../../server/utils/placementRequests/placementRequestSummaryList'
import paths from '../../../../server/paths/admin'

export default class ShowPage extends Page {
  constructor(private readonly placementRequest: PlacementRequestDetail) {
    super('Placement request')
  }

  static visit(placementRequestDetail: PlacementRequestDetail): ShowPage {
    cy.visit(paths.admin.placementRequests.show({ id: placementRequestDetail.id }))
    return new ShowPage(placementRequestDetail)
  }

  shouldShowSummary(): void {
    this.shouldContainSummaryListItems(placementRequestSummaryList(this.placementRequest).rows)
  }

  shouldNotShowBookingInformation() {
    cy.contains('Booked placement').should('not.exist')
  }

  shouldShowBookingInformation() {
    cy.contains('Booked placement').should('exist')
    this.shouldContainSummaryListItems(bookingSummaryList(this.placementRequest.booking).rows)
  }

  clickCreateBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Create placement').click()
  }

  clickAmendBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Amend placement').click()
  }

  clickWithdrawBooking() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Withdraw placement').click()
  }

  clickWithdraw() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Withdraw request for placement').click()
  }

  clickUnableToMatch() {
    cy.get('.moj-button-menu__toggle-button').click()
    cy.contains('.moj-button-menu__item', 'Mark as unable to match').click()
  }

  shouldShowCreateBookingOption() {
    this.buttonShouldExist('Create placement')
  }

  shouldShowAmendBookingOption() {
    this.buttonShouldExist('Amend placement')
  }

  shouldShowCancelBookingOption() {
    this.buttonShouldExist('Withdraw placement')
  }

  shouldNotShowCreateBookingOption() {
    this.buttonShouldNotExist('Create placement')
  }

  shouldNotShowAmendBookingOption() {
    this.buttonShouldNotExist('Amend placement')
  }

  shouldNotShowCancelBookingOption() {
    this.buttonShouldNotExist('Cance placement')
  }

  shouldShowParoleNotification() {
    cy.get('.govuk-notification-banner').contains('Parole board directed release').should('exist')
  }

  shouldShowPreferredAps(premises: Array<ApprovedPremises>) {
    const apList = premises.map(p => `<li>${p.name}</li>`)
    this.shouldContainSummaryListItems([
      {
        key: { text: 'Preferred APs' },
        value: { html: `<ol class="govuk-list govuk-list--number">${apList.join('')}</ol>` },
      },
    ])
  }

  private buttonShouldExist(text: string) {
    cy.contains('.moj-button-menu__item', text).should('exist')
  }

  private buttonShouldNotExist(text: string) {
    cy.contains('.moj-button-menu__item', text).should('not.exist')
  }
}
