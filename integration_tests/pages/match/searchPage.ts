import { SpaceSearchParametersUi } from '@approved-premises/ui'
import { Cas1SpaceSearchResult, Cas1SpaceSearchResults, PlacementRequestDetail } from '@approved-premises/api'
import Page from '../page'
import { placementRequestSummaryListForMatching, summaryCardRows } from '../../../server/utils/match'
import paths from '../../../server/paths/match'
import { occupancyCriteriaMap } from '../../../server/utils/match/occupancy'

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
      this.shouldContainSummaryListItems(placementRequestSummaryListForMatching(placementRequest))
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
    cy.get('a').contains(spaceSearchResult.premises.id).click()
  }

  changeSearchParameters(newSearchParameters: SpaceSearchParametersUi): void {
    this.getTextInputByIdAndClear('targetPostcodeDistrict')
    this.getTextInputByIdAndEnterDetails('targetPostcodeDistrict', newSearchParameters.targetPostcodeDistrict)
    cy.get('[type="checkbox"]').uncheck()

    this.checkRadioByNameAndValue('requirements[apType]', newSearchParameters.requirements.apType)

    newSearchParameters.requirements.spaceCharacteristics.forEach(requirement => {
      cy.get(`input[name="requirements[spaceCharacteristics][]"][value="${requirement}"]`).check()
    })
  }

  shouldShowSearchParametersInInputs(newSearchParameters: SpaceSearchParametersUi): void {
    this.verifyTextInputContentsById('targetPostcodeDistrict', newSearchParameters.targetPostcodeDistrict)

    cy.get(`input[name="requirements[apType]"][value="${newSearchParameters.requirements.apType}"]`)

    newSearchParameters.requirements.spaceCharacteristics.forEach(requirement => {
      cy.get(`input[name="requirements[spaceCharacteristics][]"][value="${requirement}"]`).should('be.checked')
    })
  }

  shouldHaveSearchParametersInLinks(newSearchParameters: SpaceSearchParametersUi): void {
    newSearchParameters.requirements.spaceCharacteristics.forEach(spaceCharacteristic => {
      const isSpaceBookingCharacteristic = Object.keys(occupancyCriteriaMap).includes(spaceCharacteristic)
      cy.get('.govuk-summary-card__actions .govuk-link')
        .invoke('attr', 'href')
        .should(isSpaceBookingCharacteristic ? 'contain' : 'not.contain', `criteria=${spaceCharacteristic}`)
    })
  }

  clickUnableToMatch(): void {
    cy.get('.govuk-button').contains('Unable to match').click()
  }
}
