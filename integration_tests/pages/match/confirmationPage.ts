import { Cas1SpaceSearchResult as SpaceSearchResult } from '@approved-premises/api'
import Page from '../page'
import { confirmationSummaryCardRows, placementDates } from '../../../server/utils/matchUtils'

export default class ConfirmationPage extends Page {
  constructor() {
    super('Confirm booking')
  }

  shouldShowConfirmationDetails(spaceSearchResult: SpaceSearchResult, startDate: string, duration: number) {
    const dates = placementDates(startDate, String(duration))
    this.shouldContainSummaryListItems(confirmationSummaryCardRows(spaceSearchResult, dates))
  }

  clickConfirm() {
    cy.get('button').contains('Confirm and submit').click()
  }
}
