import type { FullPerson } from '@approved-premises/api'
import { cas1SpaceBookingFactory, cas1PremisesSummaryFactory } from '../../testutils/factories'
import { actions, getKeyDetail, placementSummary, arrivalInformation, departureInformation, otherBookings } from '.'
import { addOverbookingsToSchedule } from '../addOverbookingsToSchedule'
import { textValue } from '../applications/helpers'
import paths from '../../paths/manage'
import { linkTo } from '../utils'
import { laoName } from '../personUtils'
import { DateFormats } from '../dateUtils'

describe('placementUtils', () => {
  describe('actions', () => {
    it('should allow setting of keyworker when placement in initial state', () => {
      const placement = cas1SpaceBookingFactory.build({
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
        keyWorkerAllocation: undefined,
      })
      expect(actions(placement)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Allocate keyworker' },
        { classes: 'govuk-button--secondary', href: '', text: 'Record arrival' },
      ])
    })
    it('should include with record arrival option before arrival', () => {
      const placement = cas1SpaceBookingFactory.build({ actualArrivalDate: undefined, actualDepartureDate: undefined })
      expect(actions(placement)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Record arrival' },
        { classes: 'govuk-button--secondary', href: '', text: 'Change keyworker' },
      ])
    })
    it('should include with record departure option after arrival', () => {
      const placement = cas1SpaceBookingFactory.build({ actualDepartureDate: undefined })
      expect(actions(placement)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Record departure' },
        { classes: 'govuk-button--secondary', href: '', text: 'Change keyworker' },
      ])
    })
    it('should allow change of keyworker as only option after departure', () => {
      const placement = cas1SpaceBookingFactory.build()
      expect(actions(placement)).toEqual([{ classes: 'govuk-button--secondary', href: '', text: 'Change keyworker' }])
    })
  })

  describe('getKeyDetail', () => {
    it('should allow setting of keyworker when placement in initial state', () => {
      const placement = cas1SpaceBookingFactory.build()
      expect(getKeyDetail(placement)).toEqual({
        header: { key: '', showKey: false, value: placement.person.name },
        items: [
          { key: { text: 'CRN' }, value: { text: placement.person.crn } },
          { key: { text: 'Tier' }, value: { text: placement.tier } },
          {
            key: { text: 'Date of birth' },
            value: { text: DateFormats.isoDateToUIDate(placement.person.dateOfBirth, { format: 'short' }) },
          },
        ],
      })
    })
  })

  describe('tabular information', () => {
    const placement = cas1SpaceBookingFactory.build()
    const premises = cas1PremisesSummaryFactory.build()

    it('should return the placement summary information', () => {
      expect(placementSummary(placement, premises)).toEqual({
        rows: [
          { key: { text: 'AP name' }, value: { text: premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          { key: { text: 'Status' }, value: { text: 'TBD' } },
          {
            key: { html: '<span class="text-grey">Actual length of stay</span>' },
            value: { html: '<span class="text-grey">-</span>' },
          },
          { key: { text: 'Key worker' }, value: { text: placement.keyWorkerAllocation?.keyWorker?.name } },
          { key: { text: 'Delius EventNumber' }, value: { text: 'TBD' } },
        ],
      })
    })

    it('should return the arrival information', () => {
      expect(arrivalInformation(placement)).toEqual({
        rows: [
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedArrivalDate) },
          },
          {
            key: { text: 'Actual arrival date' },
            value: { text: DateFormats.isoDateToUIDate(placement.actualArrivalDate) },
          },
          {
            key: { text: 'Time of arrival' },
            value: { text: DateFormats.timeFromDate(DateFormats.isoToDateObj(placement.actualArrivalDate)) },
          },
          {
            key: { html: '<span class="text-grey">Non arrival reason</span>' },
            value: { html: '<span class="text-grey">-</span>' },
          },
          {
            key: { html: '<span class="text-grey">Non arrival any other information</span>' },
            value: { html: '<span class="text-grey">-</span>' },
          },
        ],
      })
    })

    it('should return the departure information', () => {
      expect(departureInformation(placement)).toEqual({
        rows: [
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(placement.expectedDepartureDate) },
          },
          {
            key: { text: 'Actual departure date' },
            value: { text: DateFormats.isoDateToUIDate(placement.actualDepartureDate) },
          },
          {
            key: { text: 'Time of departure' },
            value: { text: DateFormats.timeFromDate(DateFormats.isoToDateObj(placement.actualDepartureDate)) },
          },
          { key: { text: 'Departure reason' }, value: { text: placement.departureReason?.name } },
          {
            key: { html: '<span class="text-grey">Breach or recall</span>' },
            value: { html: '<span class="text-grey">-</span>' },
          },
          { key: { text: 'Move on' }, value: { text: placement.departureMoveOnCategory?.name } },
          {
            key: { html: '<span class="text-grey">More information</span>' },
            value: { html: '<span class="text-grey">-</span>' },
          },
        ],
      })
    })
  })
  describe('otherBookings', () => {
    it('should return a list of other bookings from a placement', () => {
      const placementList = [{ id: 'id1', canonicalArrivalDate: '2024-09-10', canonicalDepartureDate: '2025-06-04' },{ id: 'id2', canonicalArrivalDate: '2024-09-20', canonicalDepartureDate: '2025-03-20' }]

      const placement = cas1SpaceBookingFactory.build({ otherBookingsInPremisesForCrn: placementList })
      expect(otherBookings(placement)).toEqual({
        rows: [
          {
            key: { text: 'Other placement bookings at this premises' },
            value: { html: '<a href=\"id1\">Placement 10 Sep 2024 to 04 Jun 2025</a><br/><a href=\"id2\">Placement 20 Sep 2024 to 20 Mar 2025</a>' },
          },
        ],
      })
    })
  })
})
