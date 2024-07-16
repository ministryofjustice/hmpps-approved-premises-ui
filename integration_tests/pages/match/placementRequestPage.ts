import Page from '../page'

import { FullPerson, PlacementRequestDetail } from '../../../server/@types/shared'
import { assessmentSummary, documentSummary, matchingInformationSummary } from '../../../server/utils/placementRequests'
import paths from '../../../server/paths/admin'

export default class PlacementRequestPage extends Page {
  constructor(private readonly placementRequest: PlacementRequestDetail) {
    super((placementRequest.person as FullPerson).name)
  }

  static visit(placementRequest: PlacementRequestDetail) {
    cy.visit(paths.admin.placementRequests.show({ id: placementRequest.id }))

    return new PlacementRequestPage(placementRequest)
  }

  shouldShowAssessmentDetails() {
    const assessmentDetails = assessmentSummary(this.placementRequest)
    cy.get('.govuk-summary-card__title')
      .contains('Assessment Information')
      .parents('.govuk-summary-card')
      .within(() => {
        this.shouldContainSummaryListItems(assessmentDetails.rows)
      })
  }

  shouldShowMatchingInformationSummary() {
    const matchingInformationDetails = matchingInformationSummary(this.placementRequest)
    cy.get('.govuk-summary-card__title')
      .contains('Information for Matching')
      .parents('.govuk-summary-card')
      .within(() => {
        this.shouldContainSummaryListItems(matchingInformationDetails.rows)
      })
  }

  shouldShowDocuments() {
    const documentDetails = documentSummary(this.placementRequest)
    cy.get('.govuk-summary-card__title')
      .contains('Documents')
      .parents('.govuk-summary-card')
      .within(() => {
        this.shouldContainSummaryListItems(documentDetails.rows)
      })
  }

  shouldShowPreviousCancellations() {
    const previousCancellations = this.placementRequest.cancellations
    cy.get('.govuk-summary-card__title')
      .contains('Previous match')
      .parents('.govuk-summary-card')
      .within(() => {
        cy.contains(previousCancellations[0].premisesName)
        cy.contains(previousCancellations[0].date)
        cy.contains(previousCancellations[0].reason.name)
        cy.contains(previousCancellations[0].notes)
      })
  }

  clickSearch() {
    cy.get('a').contains('Search for a space').click()
  }

  clickActions() {
    cy.get('button').contains('Actions').click()
  }
}
