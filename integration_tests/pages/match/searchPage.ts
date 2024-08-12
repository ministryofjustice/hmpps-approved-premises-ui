import { SpaceSearchParametersUi } from '@approved-premises/ui'
import { Cas1SpaceSearchResult, Cas1SpaceSearchResults, PlacementRequestDetail } from '@approved-premises/api'
import Page from '../page'
import { placementRequestSummaryListForMatching, summaryCardRows } from '../../../server/utils/match'
import paths from '../../../server/paths/match'
import { isFullPerson } from '../../../server/utils/personUtils'
import { DateFormats } from '../../../server/utils/dateUtils'

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

  shouldShowKeyPersonDetails(placementRequest: PlacementRequestDetail) {
    cy.get('.prisoner-info').within(() => {
      const { person } = placementRequest
      if (!isFullPerson(person)) throw new Error('test requires a Full Person')

      cy.get('span').contains(person.name)
      cy.get('span').contains(`CRN: ${person.crn}`)
      cy.get('span').contains(`Tier: ${placementRequest?.risks?.tier?.value.level}`)
      cy.get('span').contains(`Date of birth: ${DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' })}`)
    })
  }

  shouldShowMatchingDetails(placementRequest: PlacementRequestDetail) {
    cy.get('.govuk-details').within(() => {
      this.shouldContainSummaryListItems(placementRequestSummaryListForMatching(placementRequest))
    })
  }

  shouldDisplaySearchResults(spaceSearchResults: Cas1SpaceSearchResults, targetPostcodeDistrict: string): void {
    cy.get('h2').contains(`${spaceSearchResults.resultsCount} Approved Premises found`)

    spaceSearchResults.results.forEach(result => {
      cy.contains('h2', result.premises.name)
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
    this.clearDateInputs('startDate')
    this.completeDateInputs('startDate', newSearchParameters.startDate)

    this.getTextInputByIdAndClear('targetPostcodeDistrict')
    this.getTextInputByIdAndEnterDetails('targetPostcodeDistrict', newSearchParameters.targetPostcodeDistrict)
    cy.get('[type="checkbox"]').uncheck()

    this.checkRadioByNameAndValue('requirements[apType]', newSearchParameters.requirements.apType)
    this.checkRadioByNameAndValue('requirements[gender]', newSearchParameters.requirements.gender)

    newSearchParameters.requirements.spaceCharacteristics.forEach(requirement => {
      cy.get(`input[name="requirements[spaceCharacteristics][]"][value="${requirement}"]`).check()
    })
  }

  shouldShowSearchParametersInInputs(newSearchParameters: SpaceSearchParametersUi): void {
    this.dateInputsShouldContainDate('startDate', newSearchParameters.startDate)
    this.verifyTextInputContentsById('targetPostcodeDistrict', newSearchParameters.targetPostcodeDistrict)

    cy.get(`input[name="requirements[apType]"][value="${newSearchParameters.requirements.apType}"]`)
    cy.get(`input[name="requirements[gender]"][value="${newSearchParameters.requirements.gender}"]`)

    newSearchParameters.requirements.spaceCharacteristics.forEach(requirement => {
      cy.get(`input[name="requirements[spaceCharacteristics][]"][value="${requirement}"]`).should('be.checked')
    })
  }

  clickUnableToMatch(): void {
    cy.get('.govuk-button').contains('Unable to match').click()
  }
}
