import { BedSearchParameters, BedSearchResult } from '@approved-premises/api'
import Page from '../page'
import { confirmationSummaryCardRows, placementDates } from '../../../server/utils/matchUtils'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Confirm booking')
  }

  shouldShowConfirmationDetails(bedSearchResult: BedSearchResult, searchParameters: BedSearchParameters) {
    const dates = placementDates(searchParameters.startDate, searchParameters.durationDays)
    this.shouldContainSummaryListItems(confirmationSummaryCardRows(bedSearchResult, dates))
  }
}
