import { Cas1PremisesDaySummary, Cas1SpaceBookingCharacteristic } from '@approved-premises/api'
import Page from '../page'
import {
  DayAvailabilityStatus,
  dayAvailabilityStatus,
  dayAvailabilityStatusMap,
} from '../../../server/utils/match/occupancy'
import { DateFormats } from '../../../server/utils/dateUtils'
import { daySummaryRows } from '../../../server/utils/premises/occupancy'

export default class DayAvailabilityPage extends Page {
  availability: DayAvailabilityStatus

  constructor(
    private readonly premisesId: string,
    private readonly daySummary: Cas1PremisesDaySummary,
    private readonly criteria: Array<Cas1SpaceBookingCharacteristic> = [],
  ) {
    super(DateFormats.isoDateToUIDate(daySummary.forDate, { format: 'long' }))

    this.availability = dayAvailabilityStatus(daySummary.capacity, criteria)
  }

  shouldShowDayAvailability() {
    const { title, detail } = dayAvailabilityStatusMap[this.availability]
    cy.get('strong').should('contain.text', title)
    cy.get('p').should('contain.text', detail)

    const summaryList = daySummaryRows(this.daySummary, this.criteria, 'doubleRow')
    const summaryRows = summaryList.rows.filter(({ value }) => value)
    this.shouldContainSummaryListItems(summaryRows)
    cy.get('table')
      .first()
      .within(() => {
        cy.get('tbody tr').should('have.length', this.daySummary.spaceBookings.length)
        this.daySummary.spaceBookings.forEach(({ canonicalArrivalDate, canonicalDepartureDate, person: { crn } }) => {
          cy.contains(crn)
          cy.contains(DateFormats.isoDateToUIDate(canonicalArrivalDate, { format: 'short' }))
          cy.contains(DateFormats.isoDateToUIDate(canonicalDepartureDate, { format: 'short' }))
        })
      })
    cy.get('table')
      .eq(1)
      .within(() => {
        cy.get('tbody tr').should('have.length', this.daySummary.outOfServiceBeds.length)
        this.daySummary.outOfServiceBeds.forEach(({ roomName, startDate, endDate }) => {
          cy.contains(roomName)
          cy.contains(DateFormats.isoDateToUIDate(startDate, { format: 'short' }))
          cy.contains(DateFormats.isoDateToUIDate(endDate, { format: 'short' }))
        })
      })
  }
}
