import Page from '../page'
import paths from '../../../server/paths/match'
import { uiObjectValue } from '../../helpers'
import { summaryCardRows } from '../../../server/utils/matchUtils'
import { BedSearchResults } from '../../../server/@types/shared'

export default class SearchPage extends Page {
  constructor() {
    super('Find a bed')
  }

  static visit(): SearchPage {
    cy.visit(paths.beds.search({}))
    return new SearchPage()
  }

  shouldDisplaySearchResults(bedSearchResult: BedSearchResults): void {
    cy.get('h2').contains(`Matching rooms: ${bedSearchResult.resultsRoomCount}`)
    cy.get('h2').contains(`Matching premises: ${bedSearchResult.resultsPremisesCount}`)
    cy.get('h2').contains(`Matching beds: ${bedSearchResult.resultsBedCount}`)

    bedSearchResult.results.forEach(result => {
      cy.contains('div', result.premises.name)
        .parent('div')
        .within(() => {
          const tableRows = summaryCardRows(result)
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
}
