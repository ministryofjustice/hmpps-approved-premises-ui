import { Cas1SpaceSearchResult, Cas1SpaceSearchResults, PlacementRequestDetail } from '@approved-premises/api'
import { SpaceSearchFormData } from '@approved-premises/ui'
import Page from '../page'
import { summaryCardRows } from '../../../server/utils/match'
import paths from '../../../server/paths/match'
import { placementRequestSummaryList } from '../../../server/utils/placementRequests/placementRequestSummaryList'

export default class SearchPage extends Page {
  constructor() {
    super('Find a space in an Approved Premises')
  }

  static visit(placementRequest: PlacementRequestDetail) {
    cy.visit(paths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }))
    return new SearchPage()
  }

  shouldShowCaseDetails(placementRequest: PlacementRequestDetail): void {
    this.shouldShowKeyPersonDetails(placementRequest)
    this.shouldShowMatchingDetails(placementRequest)
  }

  shouldShowMatchingDetails(placementRequest: PlacementRequestDetail) {
    cy.get('.govuk-details').within(() => {
      cy.get('.govuk-details__summary').should('contain.text', 'Placement request information')
      this.shouldContainSummaryListItems(placementRequestSummaryList(placementRequest, { showActions: false }).rows)
    })
  }

  shouldDisplaySearchResults(spaceSearchResults: Cas1SpaceSearchResults, targetPostcodeDistrict: string): void {
    cy.get('h2').contains(`${spaceSearchResults.resultsCount} Approved Premises found`)

    spaceSearchResults.results.forEach(result => {
      cy.contains('h3', result.premises.name)
        .parent()
        .parent()
        .within(() => {
          const tableRows = summaryCardRows(result, targetPostcodeDistrict)
          this.shouldContainSummaryListItems(tableRows)
        })
    })
  }

  clickSearchResult(spaceSearchResult: Cas1SpaceSearchResult): void {
    cy.get(`a[href*="${spaceSearchResult.premises.id}"]`).click()
  }

  changeSearchParameters(searchState: SpaceSearchFormData): void {
    this.getTextInputByIdAndClear('postcode')
    this.getTextInputByIdAndEnterDetails('postcode', searchState.postcode)
    cy.get('[type="checkbox"]').uncheck()

    this.checkRadioByNameAndValue('apType', searchState.apType)

    searchState.apCriteria.forEach(criterion => {
      cy.get(`input[name="apCriteria[]"][value="${criterion}"]`).check()
    })
    searchState.roomCriteria.forEach(criterion => {
      cy.get(`input[name="roomCriteria[]"][value="${criterion}"]`).check()
    })
  }

  shouldShowSearchParametersInInputs(searchState: SpaceSearchFormData): void {
    this.verifyTextInputContentsById('postcode', searchState.postcode)

    cy.get(`input[name="apType"][value="${searchState.apType}"]`)

    searchState.apCriteria.forEach(criterion => {
      cy.get(`input[name="apCriteria[]"][value="${criterion}"]`).should('be.checked')
    })
    searchState.roomCriteria.forEach(criterion => {
      cy.get(`input[name="roomCriteria[]"][value="${criterion}"]`).should('be.checked')
    })
  }

  clickUnableToMatch(): void {
    cy.get('.govuk-button').contains('Unable to match').click()
  }
}
