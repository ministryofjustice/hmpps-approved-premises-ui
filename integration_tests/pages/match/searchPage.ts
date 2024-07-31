import { SpaceSearchParametersUi, TextItem } from '@approved-premises/ui'
import { Cas1SpaceSearchResult, Cas1SpaceSearchResults, PlacementRequestDetail } from '@approved-premises/api'
import Page from '../page'
import { uiObjectValue } from '../../helpers'
import { summaryCardRows } from '../../../server/utils/matchUtils'
import paths from '../../../server/paths/match'
import { isFullPerson } from '../../../server/utils/personUtils'

export default class SearchPage extends Page {
  constructor(name: string) {
    super(name)
  }

  static visit(placementRequest: PlacementRequestDetail) {
    if (!isFullPerson(placementRequest.person))
      throw Error('This test requires a FullPerson attached to the PlacementRequestDetail to work')

    cy.visit(paths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }))
    return new SearchPage(placementRequest.person.name)
  }

  shouldDisplaySearchResults(spaceSearchResults: Cas1SpaceSearchResults, targetPostcodeDistrict: string): void {
    cy.get('h2').contains(`${spaceSearchResults.resultsCount} Approved Premises found`)

    spaceSearchResults.results.forEach(result => {
      cy.contains('h2', result.premises.name)
        .parent()
        .parent()
        .within(() => {
          const tableRows = summaryCardRows(result, targetPostcodeDistrict)
          tableRows.forEach(row => {
            cy.contains('dt', (row.key as TextItem).text)
              .parent('div')
              .within(() => {
                cy.get('dd').should('contain', uiObjectValue(row.value))
              })
          })
        })
    })
  }

  clickSearchResult(spaceSearchResult: Cas1SpaceSearchResult): void {
    cy.get('a').contains(spaceSearchResult.premises.id).click()
  }

  changeSearchParameters(newSearchParameters: SpaceSearchParametersUi): void {
    this.clearDateInputs('startDate')
    this.completeDateInputs('startDate', newSearchParameters.startDate)

    this.getTextInputByIdAndClear('durationDays')
    this.getTextInputByIdAndEnterDetails('durationDays', newSearchParameters.durationDays.toString())
    this.getTextInputByIdAndClear('durationWeeks')
    this.getTextInputByIdAndEnterDetails('durationWeeks', newSearchParameters.durationWeeks.toString())

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
    this.verifyTextInputContentsById('durationDays', newSearchParameters.durationDays.toString())
    this.verifyTextInputContentsById('durationWeeks', newSearchParameters.durationWeeks.toString())
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
