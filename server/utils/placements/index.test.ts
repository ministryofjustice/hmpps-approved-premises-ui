import type { FullPerson } from '@approved-premises/api'
import { UserDetails } from '@approved-premises/ui'
import { faker } from '@faker-js/faker/locale/en_GB'
import { cas1PremisesSummaryFactory, cas1SpaceBookingFactory, userDetailsFactory } from '../../testutils/factories'
import {
  actions,
  arrivalInformation,
  departureInformation,
  getBackLink,
  getKeyDetail,
  otherBookings,
  placementSummary,
} from '.'
import { DateFormats } from '../dateUtils'

describe('placementUtils', () => {
  describe('actions', () => {
    const userDetails = userDetailsFactory.build({
      permissions: [
        'cas1_space_booking_record_arrival',
        'cas1_space_booking_record_departure',
        'cas1_space_booking_record_keyworker',
        'cas1_space_booking_view',
      ],
    })
    it('should allow setting of keyworker when placement in initial state', () => {
      const placement = cas1SpaceBookingFactory.build({
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
        keyWorkerAllocation: undefined,
      })
      expect(actions(placement, userDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Allocate keyworker' },
        { classes: 'govuk-button--secondary', href: '', text: 'Record arrival' },
      ])
    })
    it('should include with record arrival option before arrival', () => {
      const placement = cas1SpaceBookingFactory.build({ actualArrivalDate: undefined, actualDepartureDate: undefined })
      expect(actions(placement, userDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Edit keyworker' },
        { classes: 'govuk-button--secondary', href: '', text: 'Record arrival' },
      ])
    })
    it('should include with record departure option after arrival', () => {
      const placement = cas1SpaceBookingFactory.build({ actualDepartureDate: undefined })
      expect(actions(placement, userDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Edit keyworker' },
        { classes: 'govuk-button--secondary', href: '', text: 'Record departure' },
      ])
    })
    it('should allow change of keyworker as only option after departure', () => {
      const placement = cas1SpaceBookingFactory.build()
      expect(actions(placement, userDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Edit keyworker' },
      ])
    })
    it('should require the correct permissions', () => {
      const placement = cas1SpaceBookingFactory.build({
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
        keyWorkerAllocation: undefined,
      })
      expect(actions(placement, { permissions: ['cas1_space_booking_record_arrival'] } as UserDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Record arrival' },
      ])
      expect(actions(placement, { permissions: ['cas1_space_booking_record_departure'] } as UserDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Record departure' },
      ])
      expect(actions(placement, { permissions: ['cas1_space_booking_record_keyworker'] } as UserDetails)).toEqual([
        { classes: 'govuk-button--secondary', href: '', text: 'Allocate keyworker' },
      ])
    })
  })

  describe('getBackLink', () => {
    it('should return the correct back link, given the referrer', () => {
      const premises = cas1PremisesSummaryFactory.build()
      const bareUrl = `/manage/premises/${premises.id}`
      const urlWithQuery = `/manage/premises/${premises.id}?activeTab=historic&sortBy=canonicalArrivalDate`
      const urlOtherId = `/manage/premises/${faker.string.uuid()}`
      expect(getBackLink(bareUrl, premises)).toEqual(bareUrl)
      expect(getBackLink(urlWithQuery, premises)).toEqual(urlWithQuery)
      expect(getBackLink('some string', premises)).toEqual(bareUrl)
      expect(getBackLink('', premises)).toEqual(bareUrl)
      expect(getBackLink(null, premises)).toEqual(bareUrl)
      expect(getBackLink(urlOtherId, premises)).toEqual(bareUrl)
    })
  })

  describe('getKeyDetail', () => {
    it('should allow setting of keyworker when placement in initial state', () => {
      const placement = cas1SpaceBookingFactory.build()
      expect(getKeyDetail(placement)).toEqual({
        header: { key: '', showKey: false, value: (placement.person as FullPerson).name },
        items: [
          { key: { text: 'CRN' }, value: { text: placement.person.crn } },
          { key: { text: 'Tier' }, value: { text: placement.tier } },
          {
            key: { text: 'Date of birth' },
            value: {
              text: DateFormats.isoDateToUIDate((placement.person as FullPerson).dateOfBirth, { format: 'short' }),
            },
          },
        ],
      })
    })
  })

  describe('tabular information', () => {
    const placement = cas1SpaceBookingFactory.build({
      actualArrivalDate: '2024-06-01',
      actualDepartureDate: '2024-12-25',
    })
    const premises = cas1PremisesSummaryFactory.build()

    it('should return the placement summary information', () => {
      expect(placementSummary(placement, premises)).toEqual({
        rows: [
          { key: { text: 'AP name' }, value: { text: premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          { key: { text: 'Status' }, value: { text: 'TBD' } },
          {
            key: { text: 'Actual length of stay' },
            value: { text: '29 weeks, 4 days' },
          },
          { key: { text: 'Key worker' }, value: { text: placement.keyWorkerAllocation?.keyWorker?.name } },
          { key: { text: 'Delius Event Number' }, value: { text: placement.deliusEventNumber } },
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
            key: { text: 'Arrival time' },
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
            key: { text: 'Departure time' },
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
      const placementList = [
        { id: 'id1', canonicalArrivalDate: '2024-09-10', canonicalDepartureDate: '2025-06-04' },
        { id: 'id2', canonicalArrivalDate: '2024-09-20', canonicalDepartureDate: '2025-03-20' },
      ]

      const placement = cas1SpaceBookingFactory.build({ otherBookingsInPremisesForCrn: placementList })
      expect(otherBookings(placement)).toEqual({
        rows: [
          {
            key: { text: 'Other placement bookings at this premises' },
            value: {
              html: '<a href="id1">Placement 10 Sep 2024 to 04 Jun 2025</a><br/><a href="id2">Placement 20 Sep 2024 to 20 Mar 2025</a>',
            },
          },
        ],
      })
    })
  })
})
