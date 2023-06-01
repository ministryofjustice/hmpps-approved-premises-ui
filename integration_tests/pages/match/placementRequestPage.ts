import Page from '../page'

import { PlacementRequest } from '../../../server/@types/shared'
import { assessmentSummary, documentSummary, matchingInformationSummary } from '../../../server/utils/placementRequests'

export default class PlacementRequestPage extends Page {
  constructor(private readonly placementRequest: PlacementRequest) {
    super(placementRequest.person.name)
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

  clickSearch() {
    cy.get('a').contains('Search').click()
  }
}
