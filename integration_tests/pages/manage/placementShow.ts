import { Cas1SpaceBooking } from '@approved-premises/api'
import Page from '../page'
import paths from '../../../server/paths/manage'
import { DateFormats } from '../../../server/utils/dateUtils'
import { arrivalInformation, departureInformation, placementSummary } from '../../../server/utils/placements'

export default class PlacementShowPage extends Page {
  constructor(placement: Cas1SpaceBooking | null, pageHeading?: string) {
    let title = pageHeading
    if (placement) {
      title = `${DateFormats.isoDateToUIDate(placement.canonicalArrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(placement.canonicalDepartureDate, { format: 'short' })}`
    }
    super(title)
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(placement: Cas1SpaceBooking): PlacementShowPage {
    cy.visit(paths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id }))
    return new PlacementShowPage(placement)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): PlacementShowPage {
    cy.visit(paths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new PlacementShowPage(null, `Authorisation Error`)
  }

  shouldShowSummaryInformation(placement: Cas1SpaceBooking): void {
    const removeGreyRows = row => !row.key.html
    this.shouldContainSummaryListItems(placementSummary(placement).rows.filter(removeGreyRows))
    this.shouldContainSummaryListItems(arrivalInformation(placement).rows.filter(removeGreyRows))
    this.shouldContainSummaryListItems(departureInformation(placement).rows.filter(removeGreyRows))
  }

  shouldShowGreyRows(placement: Cas1SpaceBooking, rows: Array<string>): void {
    rows.forEach(title => {
      cy.contains(title).closest('.govuk-summary-list__row').should('contain', '-')
      cy.contains(title).closest('.govuk-summary-list__row').should('contain', '-')
    })
  }

  shouldShowLinkedPlacements(placementTitleList: Array<string>): void {
    placementTitleList.forEach((placementTitle: string) => {
      cy.contains('Other placement bookings at this premises').get('a').should('contain', placementTitle)
    })
  }
}
