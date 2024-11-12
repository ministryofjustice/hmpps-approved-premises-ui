import type { Cas1SpaceBooking, FullPerson, StaffMember } from '@approved-premises/api'
import { SelectOption } from '@approved-premises/ui'
import { faker } from '@faker-js/faker/locale/en_GB'
import {
  cas1PremisesSummaryFactory,
  cas1SpaceBookingFactory,
  staffMemberFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import {
  actions,
  arrivalInformation,
  departureInformation,
  getBackLink,
  getKeyDetail,
  otherBookings,
  placementSummary,
  renderKeyworkersSelectOptions,
} from '.'
import { DateFormats } from '../dateUtils'

import paths from '../../paths/manage'

describe('placementUtils', () => {
  describe('actions', () => {
    const userDetails = userDetailsFactory.build({
      permissions: [
        'cas1_space_booking_record_arrival',
        'cas1_space_booking_record_departure',
        'cas1_space_booking_record_keyworker',
      ],
    })
    const premises = cas1PremisesSummaryFactory.build()
    const placementId = 'sample_placement_id'

    const arrivalOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.arrival({ premisesId: premises.id, placementId }),
      text: 'Record arrival',
    }
    const departureOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.departure({ premisesId: premises.id, placementId }),
      text: 'Record departure',
    }
    const keyworkerOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.keyworker({ premisesId: premises.id, placementId }),
      text: 'Assign keyworker',
    }
    describe('when the placement is in its initial state', () => {
      const placementInitial = cas1SpaceBookingFactory.upcoming().build({ id: placementId, premises })
      it('should allow arrivals and assignment of keyworker', () => {
        expect(actions(placementInitial, userDetails)).toEqual([keyworkerOption, arrivalOption])
      })
      it('should require correct permissions for arrival and keyworker', () => {
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_keyworker'],
            }),
          ),
        ).toEqual([keyworkerOption])
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_arrival'],
            }),
          ),
        ).toEqual([arrivalOption])
      })
    })
    describe('when the placement has an arrival recorded, but no departure', () => {
      const placementAfterArrival = cas1SpaceBookingFactory.current().build({ id: placementId, premises })
      it('should allow departure and assigning keyworker after arrival', () => {
        expect(actions(placementAfterArrival, userDetails)).toEqual([keyworkerOption, departureOption])
      })
      it('should require correct permissions for departure', () => {
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: [],
            }),
          ),
        ).toEqual([])
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_departure'],
            }),
          ),
        ).toEqual([departureOption])
      })
    })

    describe('when the placement has both an arrival and a departure recorded', () => {
      const placementAfterDeparture = cas1SpaceBookingFactory.build({ id: placementId, premises })
      it('should allow only assigning keyworker after departure', () => {
        expect(actions(placementAfterDeparture, userDetails)).toEqual([keyworkerOption])
      })
    })
  })

  describe('getBackLink', () => {
    it('should return the correct back link, given the referrer', () => {
      const premisesId = faker.string.uuid()
      const bareUrl = `/manage/premises/${premisesId}`
      const urlWithQuery = `/manage/premises/${premisesId}?activeTab=historic&sortBy=canonicalArrivalDate`
      const urlOtherId = `/manage/premises/${faker.string.uuid()}`
      expect(getBackLink(bareUrl, premisesId)).toEqual(bareUrl)
      expect(getBackLink(urlWithQuery, premisesId)).toEqual(urlWithQuery)
      expect(getBackLink('some string', premisesId)).toEqual(bareUrl)
      expect(getBackLink('', premisesId)).toEqual(bareUrl)
      expect(getBackLink(null, premisesId)).toEqual(bareUrl)
      expect(getBackLink(urlOtherId, premisesId)).toEqual(bareUrl)
    })
  })

  describe('getKeyDetail', () => {
    it('should return the key information from the person in the placement', () => {
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
    it('should return the placement summary information', () => {
      expect(placementSummary(placement)).toEqual({
        rows: [
          { key: { text: 'AP name' }, value: { text: placement.premises.name } },
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
          { key: { text: 'Move on' }, value: { text: placement.departureMoveOnCategory?.name } },
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
      const placement = cas1SpaceBookingFactory.build({
        premises: { id: '1234' },
        otherBookingsInPremisesForCrn: placementList,
      })
      expect(otherBookings(placement)).toEqual({
        rows: [
          {
            key: { text: 'Other placement bookings at this premises' },
            value: {
              html: '<ul class="govuk-list"><li><a class="govuk-link" href="/manage/premises/1234/placements/id1">Placement 10 Sep 2024 to 04 Jun 2025</a></li><li><a class="govuk-link" href="/manage/premises/1234/placements/id2">Placement 20 Sep 2024 to 20 Mar 2025</a></li></ul>',
            },
          },
        ],
      })
    })
  })
  describe('renderKeyworkersSelectOptions', () => {
    const selectBlankOption = { text: 'Select a keyworker', value: null } as SelectOption
    it('should return a list of keyworker selection options', () => {
      const staffList: Array<StaffMember> = staffMemberFactory.buildList(3, { keyWorker: true })
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()
      const expected = [
        selectBlankOption,
        ...staffList.map(({ name, code }) => ({ text: name, value: code, selected: false })),
      ]
      const result = renderKeyworkersSelectOptions(staffList, placement)
      expect(result).toEqual(expected)
    })
    it('should remove non-keyworkers', () => {
      const staffList: Array<StaffMember> = staffMemberFactory.buildList(3, { keyWorker: false })
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()
      const result = renderKeyworkersSelectOptions(staffList, placement)
      expect(result).toEqual([selectBlankOption])
    })

    it('should exclude the currently assigned keyworker', () => {
      const staffList: Array<StaffMember> = staffMemberFactory.buildList(3, { keyWorker: true })
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build({
        keyWorkerAllocation: { keyWorker: { ...staffList[1] } },
      })
      const result = renderKeyworkersSelectOptions(staffList, placement)
      expect(result).toEqual([
        selectBlankOption,
        ...[staffList[0], staffList[2]].map(({ name, code }) => ({ text: name, value: code, selected: false })),
      ])
    })
  })
})
