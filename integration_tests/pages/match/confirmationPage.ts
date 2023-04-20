import { BedSearchResult } from '@approved-premises/api'
import { BedSearchParametersUi } from '@approved-premises/ui'
import Page from '../page'
import { confirmationSummaryCardRows, placementDates } from '../../../server/utils/matchUtils'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Confirm booking')
  }

    const dates = placementDates(searchParameters.startDate, searchParameters.durationDays)
  shouldShowConfirmationDetails(bedSearchResult: BedSearchResult, searchParameters: BedSearchParametersUi) {
    this.shouldContainSummaryListItems(confirmationSummaryCardRows(bedSearchResult, dates))
  }
}
