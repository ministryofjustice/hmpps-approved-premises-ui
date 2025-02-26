import type { Cas1SpaceBooking, FullPerson, StaffMember } from '@approved-premises/api'
import { RadioItem, SelectOption } from '@approved-premises/ui'
import {
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  restrictedPersonFactory,
  staffMemberFactory,
  userDetailsFactory,
} from '../../testutils/factories'
import {
  actions,
  arrivalInformation,
  departureInformation,
  getKeyDetail,
  injectRadioConditionalHtml,
  otherBookings,
  placementOverviewSummary,
  placementStatus,
  placementSummary,
  renderKeyworkersSelectOptions,
  requirementsInformation,
} from '.'
import { DateFormats } from '../dateUtils'

import paths from '../../paths/manage'
import { requirementsHtmlString } from '../match'
import { fullPersonFactory, unknownPersonFactory } from '../../testutils/factories/person'

describe('placementUtils', () => {
  describe('placementStatus', () => {
    const upcoming = cas1SpaceBookingSummaryFactory.upcoming()
    const current = cas1SpaceBookingSummaryFactory.current()
    const departed = cas1SpaceBookingSummaryFactory.departed()
    const nonArrival = cas1SpaceBookingSummaryFactory.nonArrival()

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-03-01'))
    })

    const testCases = [
      {
        label: 'an upcoming placement',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-05-01' },
        expected: { overall: 'upcoming', detailed: 'upcoming' },
      },
      {
        label: 'an upcoming placement starting within 6 weeks',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-04-11' },
        expected: { overall: 'upcoming', detailed: 'arrivingWithin6Weeks' },
      },
      {
        label: 'an upcoming placement starting within 2 weeks',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-03-14' },
        expected: { overall: 'upcoming', detailed: 'arrivingWithin2Weeks' },
      },
      {
        label: 'an upcoming placement starting today',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-03-01' },
        expected: { overall: 'upcoming', detailed: 'arrivingToday' },
      },
      {
        label: 'an upcoming placement overdue arrival',
        factory: upcoming,
        params: { expectedArrivalDate: '2025-02-28' },
        expected: { overall: 'upcoming', detailed: 'overdueArrival' },
      },
      {
        label: 'a current placement departing in more than 6 weeks',
        factory: current,
        params: { expectedDepartureDate: '2025-05-01' },
        expected: { overall: 'arrived', detailed: 'arrived' },
      },
      {
        label: 'a current placement departing within 2 weeks',
        factory: current,
        params: { expectedDepartureDate: '2025-03-14' },
        expected: { overall: 'arrived', detailed: 'departingWithin2Weeks' },
      },
      {
        label: 'a current placement departing today',
        factory: current,
        params: { expectedDepartureDate: '2025-03-01' },
        expected: { overall: 'arrived', detailed: 'departingToday' },
      },
      {
        label: 'a current placement overdue departure',
        factory: current,
        params: { expectedDepartureDate: '2025-02-28' },
        expected: { overall: 'arrived', detailed: 'overdueDeparture' },
      },
      {
        label: 'a departed placement',
        factory: departed,
        params: {},
        expected: { overall: 'departed', detailed: 'departed' },
      },
      {
        label: 'a non-arrived placement',
        factory: nonArrival,
        params: {},
        expected: { overall: 'notArrived', detailed: 'notArrived' },
      },
    ]

    it.each(testCases)('should return a status for $label', ({ factory, params, expected }) => {
      const placement = factory.build(params)

      expect(placementStatus(placement)).toEqual(expected.detailed)
      expect(placementStatus(placement, 'detailed')).toEqual(expected.detailed)
      expect(placementStatus(placement, 'overall')).toEqual(expected.overall)
    })
  })

  describe('actions', () => {
    const userDetails = userDetailsFactory.build({
      permissions: [
        'cas1_space_booking_record_arrival',
        'cas1_space_booking_record_departure',
        'cas1_space_booking_record_keyworker',
        'cas1_space_booking_record_non_arrival',
      ],
    })
    const premises = cas1PremisesFactory.build()
    const placementId = 'sample_placement_id'

    const wrapOptions = (optionList: unknown) => [{ items: optionList }]

    const arrivalOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.arrival({ premisesId: premises.id, placementId }),
      text: 'Record arrival',
    }
    const nonArrivalOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.nonArrival({ premisesId: premises.id, placementId }),
      text: 'Record non-arrival',
    }
    const departureOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.departure.new({ premisesId: premises.id, placementId }),
      text: 'Record departure',
    }
    const keyworkerOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.keyworker({ premisesId: premises.id, placementId }),
      text: 'Edit keyworker',
    }
    describe('when the placement is in its initial state', () => {
      const placementInitial = cas1SpaceBookingFactory.upcoming().build({ id: placementId, premises })
      it('should allow arrivals, non-arrivals and assignment of keyworker', () => {
        expect(actions(placementInitial, userDetails)).toEqual(
          wrapOptions([keyworkerOption, arrivalOption, nonArrivalOption]),
        )
      })
      it('should require correct permissions for arrival, non-arrival and keyworker', () => {
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_keyworker'],
            }),
          ),
        ).toEqual(wrapOptions([keyworkerOption]))
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_arrival'],
            }),
          ),
        ).toEqual(wrapOptions([arrivalOption]))
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_non_arrival'],
            }),
          ),
        ).toEqual(wrapOptions([nonArrivalOption]))
      })
    })

    describe('when the placement is marked as non-arrival', () => {
      const placementNonArrival = cas1SpaceBookingFactory.nonArrival().build({ id: placementId, premises })
      it('should allow nothing', () => {
        expect(actions(placementNonArrival, userDetails)).toEqual(null)
      })
    })

    describe('when the placement has an arrival recorded, but no departure', () => {
      const placementAfterArrival = cas1SpaceBookingFactory.current().build({ id: placementId, premises })
      it('should allow departure and assigning keyworker after arrival', () => {
        expect(actions(placementAfterArrival, userDetails)).toEqual([{ items: [keyworkerOption, departureOption] }])
      })
      it('should require correct permissions for departure', () => {
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: [],
            }),
          ),
        ).toEqual(null)
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_departure'],
            }),
          ),
        ).toEqual([{ items: [departureOption] }])
      })
    })

    describe('when the placement has both an arrival and a departure recorded', () => {
      const placementAfterDeparture = cas1SpaceBookingFactory.build({ id: placementId, premises })
      it('should allow nothing', () => {
        expect(actions(placementAfterDeparture, userDetails)).toEqual(null)
      })
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

    it('should prefix the name with LAO if the person is LAO', () => {
      const placement = cas1SpaceBookingFactory.build({
        person: fullPersonFactory.build({
          isRestricted: true,
        }),
      })

      const result = getKeyDetail(placement)

      expect(result.header.value).toEqual(`LAO: ${(placement.person as FullPerson).name}`)
    })

    it('should not show the name or date of birth for a restricted person', () => {
      const placement = cas1SpaceBookingFactory.build({
        person: restrictedPersonFactory.build(),
      })

      expect(getKeyDetail(placement)).toEqual({
        header: { key: '', showKey: false, value: 'Limited Access Offender' },
        items: [
          { key: { text: 'CRN' }, value: { text: placement.person.crn } },
          { key: { text: 'Tier' }, value: { text: placement.tier } },
        ],
      })
    })

    it('should not show the name or date of birth for an unknown person', () => {
      const placement = cas1SpaceBookingFactory.build({
        person: unknownPersonFactory.build(),
      })

      expect(getKeyDetail(placement)).toEqual({
        header: { key: '', showKey: false, value: 'Unknown person' },
        items: [
          { key: { text: 'CRN' }, value: { text: placement.person.crn } },
          { key: { text: 'Tier' }, value: { text: placement.tier } },
        ],
      })
    })
  })

  describe('tabular information', () => {
    const placement = cas1SpaceBookingFactory.build({
      expectedArrivalDate: '2024-05-30',
      expectedDepartureDate: '2024-12-24',
      actualArrivalDateOnly: '2024-06-01',
      actualDepartureDateOnly: '2024-12-25',
      createdAt: '2024-03-03',
      characteristics: ['isESAP', 'acceptsNonSexualChildOffenders', 'hasEnSuite'],
    })

    it('should return the placement summary information', () => {
      expect(placementSummary(placement)).toEqual({
        rows: [
          { key: { text: 'AP name' }, value: { text: placement.premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          { key: { text: 'Status' }, value: { text: 'Departed' } },
          {
            key: { text: 'Actual length of stay' },
            value: { text: '29 weeks, 4 days' },
          },
          { key: { text: 'Key worker' }, value: { text: placement.keyWorkerAllocation?.keyWorker?.name } },
          { key: { text: 'Delius Event Number' }, value: { text: placement.deliusEventNumber } },
        ],
      })
    })

    describe('Overview placement summary', () => {
      it('should return an overview of the placement summary information before arrival', () => {
        const unarrivedPlacement: Cas1SpaceBooking = {
          ...placement,
          actualArrivalDateOnly: undefined,
          actualDepartureDateOnly: undefined,
        }

        expect(placementOverviewSummary(unarrivedPlacement)).toEqual({
          rows: [
            { key: { text: 'Approved premises' }, value: { text: unarrivedPlacement.premises.name } },
            { key: { text: 'Date of match' }, value: { text: 'Sun 3 Mar 2024' } },
            { key: { text: 'Expected arrival date' }, value: { text: 'Thu 30 May 2024' } },
            { key: { text: 'Expected departure date' }, value: { text: 'Tue 24 Dec 2024' } },
            {
              key: { text: 'Room criteria' },
              value: { html: `<ul class="govuk-list govuk-list--bullet"><li>En-suite</li></ul>` },
            },
          ],
        })
      })

      it('should return an overview of the placement summary information after arrival', () => {
        const expectedSpaceTypeHtml = `<ul class="govuk-list govuk-list--bullet"><li>En-suite</li></ul>`

        expect(placementOverviewSummary(placement)).toEqual({
          rows: [
            { key: { text: 'Approved premises' }, value: { text: placement.premises.name } },
            { key: { text: 'Date of match' }, value: { text: 'Sun 3 Mar 2024' } },
            { key: { text: 'Expected arrival date' }, value: { text: 'Thu 30 May 2024' } },
            { key: { text: 'Actual arrival date' }, value: { text: 'Sat 1 Jun 2024' } },
            { key: { text: 'Expected departure date' }, value: { text: 'Tue 24 Dec 2024' } },
            { key: { text: 'Room criteria' }, value: { html: expectedSpaceTypeHtml } },
          ],
        })
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
            value: { text: DateFormats.isoDateToUIDate(placement.actualArrivalDateOnly) },
          },
          {
            key: { text: 'Arrival time' },
            value: { text: placement.actualArrivalTime || '' },
          },
        ],
      })
    })

    it('should return the arrival information if non-arrival', () => {
      const nonArrivalplacement = cas1SpaceBookingFactory.nonArrival().build()
      const { expectedArrivalDate, nonArrival } = nonArrivalplacement
      const { notes, reason, confirmedAt } = nonArrival
      expect(arrivalInformation(nonArrivalplacement)).toEqual({
        rows: [
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(expectedArrivalDate) },
          },
          {
            key: { text: 'Non arrival recorded at' },
            value: {
              text: `${DateFormats.isoDateToUIDate(confirmedAt)} ${DateFormats.timeFromDate(DateFormats.isoToDateObj(confirmedAt))}`,
            },
          },
          {
            key: { text: 'Non arrival reason' },
            value: { text: reason.name },
          },
          {
            key: { text: 'Non arrival any other information' },
            value: { text: notes },
          },
        ],
      })
    })

    describe('departure information', () => {
      it('should be returned for a non-breach, non-planned-move-on departure', () => {
        const departedPlacement = cas1SpaceBookingFactory.departed().build()

        expect(departureInformation(departedPlacement)).toEqual({
          rows: [
            {
              key: { text: 'Expected departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.expectedDepartureDate) },
            },
            {
              key: { text: 'Actual departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDateOnly) },
            },
            {
              key: { text: 'Departure time' },
              value: {
                text: (departedPlacement.actualDepartureTime || '').substring(0, 5),
              },
            },
            { key: { text: 'Departure reason' }, value: { text: departedPlacement.departure?.reason?.name } },
            {
              key: { text: 'More information' },
              value: {
                html: `<span class="govuk-summary-list__textblock">${departedPlacement.departure?.notes}</span>`,
              },
            },
          ],
        })
      })

      it('should be returned for a breach or recall departure', () => {
        const departedPlacement = cas1SpaceBookingFactory.departedBreachOrRecall().build()

        expect(departureInformation(departedPlacement)).toEqual({
          rows: [
            {
              key: { text: 'Expected departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.expectedDepartureDate) },
            },
            {
              key: { text: 'Actual departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDateOnly) },
            },
            {
              key: { text: 'Departure time' },
              value: {
                text: (departedPlacement.actualDepartureTime || '').substring(0, 5),
              },
            },
            { key: { text: 'Departure reason' }, value: { text: departedPlacement.departure?.parentReason?.name } },
            { key: { text: 'Breach or recall' }, value: { text: departedPlacement.departure?.reason?.name } },
            {
              key: { text: 'More information' },
              value: {
                html: `<span class="govuk-summary-list__textblock">${departedPlacement.departure?.notes}</span>`,
              },
            },
          ],
        })
      })

      it('should be returned for a planned move on departure', () => {
        const departedPlacement = cas1SpaceBookingFactory.departedPlannedMoveOn().build()

        expect(departureInformation(departedPlacement)).toEqual({
          rows: [
            {
              key: { text: 'Expected departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.expectedDepartureDate) },
            },
            {
              key: { text: 'Actual departure date' },
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDateOnly) },
            },
            {
              key: { text: 'Departure time' },
              value: {
                text: (departedPlacement.actualDepartureTime || '').substring(0, 5),
              },
            },
            { key: { text: 'Departure reason' }, value: { text: departedPlacement.departure?.reason?.name } },
            { key: { text: 'Move on' }, value: { text: departedPlacement.departure?.moveOnCategory?.name } },
            {
              key: { text: 'More information' },
              value: {
                html: `<span class="govuk-summary-list__textblock">${departedPlacement.departure?.notes}</span>`,
              },
            },
          ],
        })
      })
    })

    describe('requirements information', () => {
      it('should be returned for a placement in a standard AP', () => {
        const placementStandardAp = cas1SpaceBookingFactory.build({
          characteristics: ['acceptsChildSexOffenders', 'acceptsNonSexualChildOffenders', 'hasEnSuite'],
        })

        expect(requirementsInformation(placementStandardAp)).toEqual({
          rows: [
            { key: { text: 'AP type' }, value: { text: 'Standard AP' } },
            {
              key: { text: 'AP requirements' },
              value: { html: requirementsHtmlString(['acceptsChildSexOffenders', 'acceptsNonSexualChildOffenders']) },
            },
            { key: { text: 'Room requirements' }, value: { html: requirementsHtmlString(['hasEnSuite']) } },
          ],
        })
      })

      it('should be returned for a placement in a specialist AP', () => {
        const placementSpecialistAp = cas1SpaceBookingFactory.build({
          characteristics: ['isESAP', 'acceptsChildSexOffenders', 'hasEnSuite', 'isWheelchairAccessible'],
        })

        expect(requirementsInformation(placementSpecialistAp)).toEqual({
          rows: [
            { key: { text: 'AP type' }, value: { text: 'Enhanced Security AP (ESAP)' } },
            {
              key: { text: 'AP requirements' },
              value: { html: requirementsHtmlString(['acceptsChildSexOffenders']) },
            },
            {
              key: { text: 'Room requirements' },
              value: { html: requirementsHtmlString(['hasEnSuite', 'isWheelchairAccessible']) },
            },
          ],
        })
      })

      it('should be returned for a placement with no requirements', () => {
        const placementNoRequirements = cas1SpaceBookingFactory.build({
          characteristics: [],
        })

        expect(requirementsInformation(placementNoRequirements)).toEqual({
          rows: [
            { key: { text: 'AP type' }, value: { text: 'Standard AP' } },
            { key: { text: 'AP requirements' }, value: { html: `<span class="text-grey">None</span>` } },
            { key: { text: 'Room requirements' }, value: { html: `<span class="text-grey">None</span>` } },
          ],
        })
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
              html: '<ul class="govuk-list"><li><a class="govuk-link" href="/manage/premises/1234/placements/id1">Placement 10 Sep 2024 to 4 Jun 2025</a></li><li><a class="govuk-link" href="/manage/premises/1234/placements/id2">Placement 20 Sep 2024 to 20 Mar 2025</a></li></ul>',
            },
          },
        ],
      })
    })
  })
  describe('renderKeyworkersSelectOptions', () => {
    const selectBlankOption: SelectOption = { text: 'Select a keyworker', value: null }
    const staffList: Array<StaffMember> = staffMemberFactory.buildList(3, { keyWorker: true })

    it('should return a list of keyworker selection options', () => {
      const placement: Cas1SpaceBooking = cas1SpaceBookingFactory.build()
      const expected = [
        selectBlankOption,
        ...staffList.map(({ name, code }) => ({ text: name, value: code, selected: false })),
      ]

      const result = renderKeyworkersSelectOptions(staffList, placement)

      expect(result).toEqual(expected)
    })

    it('should exclude the currently assigned keyworker', () => {
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

  describe('injectRadioConditionalHtml', () => {
    it('should inject the supplied html into the radio list as a condtional', () => {
      const radioList: Array<RadioItem> = [
        { text: 'One', value: 'one' },
        { text: 'Two', value: 'two' },
        { text: 'Three', value: 'three' },
      ]
      const testHtml = 'test HTML'
      expect(injectRadioConditionalHtml(radioList, 'two', testHtml)).toEqual(
        expect.arrayContaining([{ text: 'Two', value: 'two', conditional: { html: testHtml } }]),
      )
    })
  })
})
