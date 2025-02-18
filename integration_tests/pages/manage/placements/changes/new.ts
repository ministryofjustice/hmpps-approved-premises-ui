import { Cas1SpaceBooking } from '@approved-premises/api'
import OccupancyFilterPage from '../../../shared/occupancyFilterPage'
import { placementOverviewSummary } from '../../../../../server/utils/placements'
import paths from '../../../../../server/paths/manage'
import { DateFormats, daysToWeeksAndDays } from '../../../../../server/utils/dateUtils'

export class ChangePlacementPage extends OccupancyFilterPage {
  constructor(private readonly placement: Cas1SpaceBooking) {
    super(placement.actualArrivalDateOnly ? 'Extend placement' : 'Change placement')
  }

  static visit(placement: Cas1SpaceBooking): ChangePlacementPage {
    cy.visit(paths.premises.placements.changes.new({ placementId: placement.id, premisesId: placement.premises.id }))
    return new ChangePlacementPage(placement)
  }

  shouldShowPlacementOverview() {
    this.shouldContainSummaryListItems(placementOverviewSummary(this.placement).rows)
  }

  shouldShowCalendarHeading(startDate, durationDays) {
    cy.get('h2').contains(
      `View availability for ${DateFormats.formatDuration(daysToWeeksAndDays(durationDays))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`,
    )
  }

  completeForm(arrivalDate: string, departureDate: string) {
    this.clearAndCompleteDateInputs('arrivalDate', arrivalDate)
    this.clearAndCompleteDateInputs('departureDate', departureDate)
  }
}
