import { Cas1SpaceBooking } from '@approved-premises/api'
import OccupancyFilterPage from '../../../shared/occupancyFilterPage'
import { placementOverviewSummary } from '../../../../../server/utils/placements'
import paths from '../../../../../server/paths/manage'
import { DateFormats } from '../../../../../server/utils/dateUtils'

export class ChangePlacementPage extends OccupancyFilterPage {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super(placement.actualArrivalDate ? 'Extend placement' : 'Change placement')
  }

  static visit(placement: Cas1SpaceBooking): ChangePlacementPage {
    cy.visit(paths.premises.placements.changes.new({ placementId: placement.id, premisesId: placement.premises.id }))
    return new ChangePlacementPage(placement)
  }

  shouldShowPlacementOverview() {
    this.shouldContainSummaryListItems(placementOverviewSummary(this.placement).rows)
  }

  shouldShowCalendarHeading(startDate: string, durationDays: number) {
    cy.get('h2')
      .contains(/^(View availability for|Showing)/)
      .contains(
        `${DateFormats.formatDuration(durationDays)} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`,
      )
  }

  completeForm(arrivalDate: string, departureDate: string) {
    this.clearAndCompleteDateInputs('arrivalDate', arrivalDate)
    this.clearAndCompleteDateInputs('departureDate', departureDate)
  }
}
