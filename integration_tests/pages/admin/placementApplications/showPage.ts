import Page from '../../page'

import { PlacementRequest, PlacementRequestDetail } from '../../../../server/@types/shared'
import { adminSummary, matchingInformationSummary } from '../../../../server/utils/placementRequests'
import { bookingSummaryList } from '../../../../server/utils/bookingUtils'

export default class ShowPage extends Page {
  constructor(private readonly placementRequest: PlacementRequestDetail) {
    super(placementRequest.person.name)
  }

  shouldShowSummary(): void {
    this.shouldContainSummaryListItems(adminSummary(this.placementRequest).rows)
  }

  shouldShowMatchingInformationSummary(): void {
    this.shouldContainSummaryListItems(matchingInformationSummary(this.placementRequest).rows)
  }

  clickPlacementRequest(placementRequest: PlacementRequest): void {
    cy.get(`[data-cy-placementRequestId="${placementRequest.id}"]`).click()
  }

  shouldNotShowBookingInformation() {
    cy.contains('Matched Placement').should('not.exist')
  }

  shouldShowBookingInformation() {
    cy.contains('Matched Placement').should('exist')
    this.shouldContainSummaryListItems(bookingSummaryList(this.placementRequest.booking).rows)
  }

  shouldShowCreateBookingOption() {
    this.buttonShouldExist('Create placement')
  }

  shouldShowAmendBookingOption() {
    this.buttonShouldExist('Amend placement')
  }

  shouldShowCancelBookingOption() {
    this.buttonShouldExist('Cancel placement')
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

  private buttonShouldExist(text: string) {
    cy.contains('.moj-button-menu__item', text).should('exist')
  }

  private buttonShouldNotExist(text: string) {
    cy.contains('.moj-button-menu__item', text).should('not.exist')
  }
}
