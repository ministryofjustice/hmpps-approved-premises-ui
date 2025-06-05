import type { Cas1PlacementRequestDetail, Cas1Premises, PlacementRequestDetail } from '@approved-premises/api'
import paths from '../../../server/paths/match'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import { placementRequestSummaryList } from '../../../server/utils/placementRequests/placementRequestSummaryList'
import OccupancyFilterPage from '../shared/occupancyFilterPage'

export default class OccupancyViewPage extends OccupancyFilterPage {
  constructor(premisesName: string) {
    super(`View spaces in ${premisesName}`)
  }

  static visit(placementRequest: PlacementRequestDetail, premises: Cas1Premises) {
    const path = paths.v2Match.placementRequests.search.occupancy({ id: placementRequest.id, premisesId: premises.id })

    cy.visit(path)

    return new OccupancyViewPage(premises.name)
  }

  shouldShowMatchingDetails(startDate: string, durationDays: number, placementRequest: Cas1PlacementRequestDetail) {
    cy.get('.govuk-details').within(() => {
      cy.get('.govuk-details__summary').should('contain.text', 'Placement request information')
      this.shouldContainSummaryListItems(placementRequestSummaryList(placementRequest, { showActions: false }).rows)
    })
    cy.get('.govuk-heading-l')
      .contains(
        `View availability for ${DateFormats.formatDuration(daysToWeeksAndDays(durationDays))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`,
      )
      .should('exist')
  }

  completeForm(arrivalDate: string, departureDate: string) {
    this.completeDateInputs('arrivalDate', arrivalDate)
    this.completeDateInputs('departureDate', departureDate)
  }

  shouldShowErrorSummaryAndErrorMessage(message: string): void {
    cy.get('.govuk-error-summary').should('contain', message)
    cy.get(`.govuk-error-message`).should('contain', message)
  }
}
