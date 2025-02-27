import { Cas1SpaceBooking, PlacementRequest } from '@approved-premises/api'
import Page from '../../page'
import paths from '../../../../server/paths/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import {
  PlacementTab,
  arrivalInformation,
  canonicalDates,
  departureInformation,
  placementSummary,
  requirementsInformation,
} from '../../../../server/utils/placements'
import { placementDates, placementLength } from '../../../../server/utils/match'

export default class PlacementShowPage extends Page {
  constructor(placement: Cas1SpaceBooking | null, pageHeading?: string) {
    let title = pageHeading
    if (placement) {
      const { arrivalDate, departureDate } = canonicalDates(placement)
      title = `${DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })} to ${DateFormats.isoDateToUIDate(departureDate, { format: 'short' })}`
    }
    super(title)
    this.checkPhaseBanner('Give us your feedback')
  }

  static visit(placement: Cas1SpaceBooking, tab: PlacementTab = null): PlacementShowPage {
    const params = { premisesId: placement.premises.id, placementId: placement.id }
    const path = (() => {
      switch (tab) {
        case 'application':
          return paths.premises.placements.showTabApplication(params)
        case 'assessment':
          return paths.premises.placements.showTabAssessment(params)
        case 'placementRequest':
          return paths.premises.placements.showTabPlacementRequest(params)
        case 'timeline':
          return paths.premises.placements.showTabTimeline(params)
        default:
          return paths.premises.placements.show(params)
      }
    })()

    cy.visit(path)
    return new PlacementShowPage(placement)
  }

  static visitUnauthorised(placement: Cas1SpaceBooking): PlacementShowPage {
    cy.visit(paths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id }), {
      failOnStatusCode: false,
    })
    return new PlacementShowPage(null, `Authorisation Error`)
  }

  shouldShowSummaryInformation(placement: Cas1SpaceBooking): void {
    const removeHiddenRows = row => row.key
    this.shouldContainSummaryListItems(placementSummary(placement).rows.filter(removeHiddenRows))
    this.shouldContainSummaryListItems(arrivalInformation(placement).rows.filter(removeHiddenRows))
    this.shouldContainSummaryListItems(departureInformation(placement).rows.filter(removeHiddenRows))
    this.shouldContainSummaryListItems(requirementsInformation(placement).rows)
  }

  shouldNotShowUnpopulatedRows(placement: Cas1SpaceBooking, rows: Array<string>): void {
    rows.forEach(title => {
      cy.contains(title).should('not.exist')
    })
  }

  shouldShowLinkedPlacements(placementTitleList: Array<string>): void {
    placementTitleList.forEach((placementTitle: string) => {
      cy.contains('Other placement bookings at this premises').get('a').should('contain', placementTitle)
    })
  }

  shouldShowPlacementRequestDetails(placementRequest: PlacementRequest): void {
    cy.get('dl[data-cy-section="placement-request-summary"').within(() => {
      const dates = placementDates(placementRequest.expectedArrival, String(placementRequest.duration))
      this.assertDefinition('Requested Arrival Date', DateFormats.isoDateToUIDate(dates.startDate, { format: 'short' }))
      this.assertDefinition('Requested Departure Date', DateFormats.isoDateToUIDate(dates.endDate, { format: 'short' }))
      this.assertDefinition('Length of stay', placementLength(dates.placementLength))
    })
  }
}
