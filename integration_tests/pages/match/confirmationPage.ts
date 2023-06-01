import { BedSearchResult } from '@approved-premises/api'
import { BedSearchParametersUi } from '@approved-premises/ui'
import Page from '../page'
import { confirmationSummaryCardRows, placementDates } from '../../../server/utils/matchUtils'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Confirm booking')
  }

  shouldShowConfirmationDetails(bedSearchResult: BedSearchResult, searchParameters: BedSearchParametersUi) {
    const dates = placementDates(searchParameters.startDate, searchParameters.durationWeeks)
    this.shouldContainSummaryListItems(confirmationSummaryCardRows(bedSearchResult, dates))
  }

  clickConfirm() {
    cy.get('button').contains('Confirm and submit').click()
  }
}
