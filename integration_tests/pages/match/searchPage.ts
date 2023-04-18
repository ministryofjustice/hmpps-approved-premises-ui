import { TextItem } from '@approved-premises/ui'
import Page from '../page'
import { uiObjectValue } from '../../helpers'
import { summaryCardRows } from '../../../server/utils/matchUtils'
import {
  ApprovedPremisesBedSearchParameters as BedSearchParameters,
  BedSearchResult,
  BedSearchResults,
} from '../../../server/@types/shared'

export default class SearchPage extends Page {
  constructor(name: string) {
    super(name)
  }

  shouldDisplaySearchResults(bedSearchResults: BedSearchResults, searchParams: BedSearchParameters): void {
    cy.get('h2').contains(
      `${bedSearchResults.resultsBedCount} matching beds in ${bedSearchResults.resultsRoomCount} rooms in ${bedSearchResults.resultsPremisesCount} premises`,
    )

    bedSearchResults.results.forEach(result => {
      cy.contains('div', result.premises.name)
        .parent('div')
        .within(() => {
          const tableRows = summaryCardRows(result, searchParams.requiredCharacteristics)
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

  clickSearchResult(bedSearchResult: BedSearchResult): void {
    cy.get('a').contains(bedSearchResult.bed.name).click()
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
