import Page from '../page'
import paths from '../../../server/paths/match'
import { uiObjectValue } from '../../helpers'
import { summaryCardRows } from '../../../server/utils/matchUtils'
import {
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  BedSearchResults,
} from '../../../server/@types/shared'

export default class SearchPage extends Page {
  constructor(name: string) {
    super(name)
  }

  static visit(name: string): SearchPage {
    cy.visit(paths.beds.search({}))
    return new SearchPage(name)
  }

  shouldDisplaySearchResults(bedSearchResult: BedSearchResults, searchParams: BedSearchParameters): void {
    cy.get('h2').contains(
      `${bedSearchResult.resultsBedCount} matching beds in ${bedSearchResult.resultsRoomCount} rooms in ${bedSearchResult.resultsPremisesCount} premises`,
    )

    bedSearchResult.results.forEach(result => {
      cy.contains('div', result.premises.name)
        .parent('div')
        .within(() => {
          const tableRows = summaryCardRows(result, searchParams.requiredCharacteristics)
          tableRows.forEach(row => {
            cy.contains('dt', row.key.text)
              .parent('div')
              .within(() => {
                cy.get('dd').should('contain', uiObjectValue(row.value))
              })
          })
        })
    })
  }

  changeSearchParameters(newSearchParameters: BedSearchParameters): void {
    this.getTextInputByIdAndClear('durationDays')
    this.getTextInputByIdAndEnterDetails('durationDays', newSearchParameters.durationDays.toString())
    this.clearDateInputs('startDate')
    this.completeDateInputs('startDate', newSearchParameters.startDate)
    this.getTextInputByIdAndClear('postcodeDistrict')
    this.getTextInputByIdAndEnterDetails('postcodeDistrict', newSearchParameters.postcodeDistrict)
    this.getTextInputByIdAndClear('maxDistanceMiles')
    this.getTextInputByIdAndEnterDetails('maxDistanceMiles', newSearchParameters.maxDistanceMiles.toString())
    cy.get('[type="checkbox"]').uncheck()

    newSearchParameters.requiredCharacteristics.forEach(characteristic => {
      this.checkCheckboxByNameAndValue('selectedRequiredCharacteristics', characteristic)
    })
  }
}
