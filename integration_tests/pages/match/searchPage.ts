import { Cas1PlacementRequestDetail, Cas1SpaceSearchResult, Cas1SpaceSearchResults } from '@approved-premises/api'
import { SpaceSearchFormData } from '@approved-premises/ui'
import Page from '../page'
import { addressRow, apTypeRow, distanceRow, restrictionsRow } from '../../../server/utils/match'
import paths from '../../../server/paths/match'
import { placementRequestSummaryList } from '../../../server/utils/placementRequests/placementRequestSummaryList'
import { characteristicsBulletList } from '../../../server/utils/characteristicsUtils'
import { spaceSearchResultsCharacteristicsLabels } from '../../../server/utils/match/spaceSearchLabels'

export default class SearchPage extends Page {
  constructor() {
    super('Find a space in an Approved Premises')
  }

  static visit(placementRequest: Cas1PlacementRequestDetail) {
    cy.visit(paths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }))
    return new SearchPage()
  }

  shouldShowCaseDetails(placementRequest: Cas1PlacementRequestDetail): void {
    this.shouldShowKeyPersonDetails(placementRequest)
    this.shouldShowMatchingDetails(placementRequest)
  }

  shouldShowMatchingDetails(placementRequest: Cas1PlacementRequestDetail) {
    cy.get('.govuk-details')
      .first()
      .within(() => {
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
          this.shouldExpandDetails('View AP criteria')
          const tableRows = [
            apTypeRow(result.premises.apType),
            addressRow(result),
            distanceRow(result, targetPostcodeDistrict),
            restrictionsRow(result),
          ].filter(Boolean)
          this.shouldContainSummaryListItems(tableRows)
          const characteristicsHtml = characteristicsBulletList(result.premises.characteristics, {
            labels: spaceSearchResultsCharacteristicsLabels,
          })
          cy.get('.govuk-details__text').should('contain.html', characteristicsHtml)
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
