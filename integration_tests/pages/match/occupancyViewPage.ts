import {
  ApType,
  Cas1PremiseCapacity,
  PlacementDates,
  PlacementRequest,
  PlacementRequestDetail,
  Premises,
} from '@approved-premises/api'
import Page from '../page'
import {
  filterOutAPTypes,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
} from '../../../server/utils/match'
import { createQueryString } from '../../../server/utils/utils'
import paths from '../../../server/paths/match'
import { DateFormats, daysToWeeksAndDays } from '../../../server/utils/dateUtils'
import { dateRangeAvailability } from '../../../server/utils/match/occupancy'

export default class OccupancyViewPage extends Page {
  constructor(premisesName: string) {
    super(`View spaces in ${premisesName}`)
  }

  static visit(
    placementRequest: PlacementRequestDetail,
    startDate: string,
    durationDays: PlacementDates['duration'],
    premisesName: Premises['name'],
    premisesId: Premises['id'],
    apType: ApType,
  ) {
    const queryString = createQueryString({ startDate, durationDays, premisesName, premisesId, apType })
    const path = `${paths.v2Match.placementRequests.spaceBookings.viewSpaces({ id: placementRequest.id })}?${queryString}`
    cy.visit(path)
    return new OccupancyViewPage(premisesName)
  }

  shouldShowMatchingDetails(
    totalCapacity: number,
    startDate: string,
    durationDays: number,
    placementRequest: PlacementRequest,
  ) {
    const dates = placementDates(startDate, durationDays.toString())
    const essentialCharacteristics = filterOutAPTypes(placementRequest.essentialCriteria)
    cy.get('.govuk-details').within(() => {
      this.shouldContainSummaryListItems(
        occupancyViewSummaryListForMatchingDetails(totalCapacity, dates, placementRequest, essentialCharacteristics),
      )
    })
    cy.get('.govuk-heading-l')
      .contains(
        `View availability and book your placement for ${DateFormats.formatDuration(daysToWeeksAndDays(durationDays))} from ${DateFormats.isoDateToUIDate(startDate, { format: 'short' })}`,
      )
      .should('exist')
  }

  shouldShowOccupancySummary(premiseCapacity: Cas1PremiseCapacity) {
    const availability = dateRangeAvailability(premiseCapacity)

    if (availability === 'available') {
      this.shouldShowBanner('The placement dates you have selected are available.')
    } else if (availability === 'none') {
      this.shouldShowBanner('There are no spaces available for the dates you have selected.')
    } else {
      this.shouldShowBanner('Available on:')
      this.shouldShowBanner('Overbooked on:')
    }
  }

  shouldShowCalendarCell(copy: string | RegExp) {
    cy.get('.calendar__availability').contains(copy).should('exist')
  }

  shouldShowOccupancyCalendar(premiseCapacity: Cas1PremiseCapacity) {
    const firstMonth = DateFormats.isoDateToMonthAndYear(premiseCapacity.startDate)
    cy.get('.govuk-heading-m').contains(firstMonth).should('exist')

    const availability = dateRangeAvailability(premiseCapacity)
    if (availability === 'available' || availability === 'partial') {
      this.shouldShowCalendarCell('Available')
    }
    if (availability === 'none' || availability === 'partial') {
      this.shouldShowCalendarCell(/-?\d+ total/)
    }
  }
}
