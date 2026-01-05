import type { Cas1SpaceBooking } from '@approved-premises/api'
import { RadioItem } from '@approved-premises/ui'
import {
  cas1CurrentKeyworkerFactory,
  cas1KeyworkerAllocationFactory,
  cas1PremisesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingShortSummaryFactory,
  cas1SpaceBookingSummaryFactory,
  userDetailsFactory,
  userSummaryFactory,
} from '../../testutils/factories'
import {
  actions,
  arrivalInformation,
  canonicalDates,
  departureInformation,
  injectRadioConditionalHtml,
  otherBookings,
  placementKeyDetails,
  placementOverviewSummary,
  placementStatusTag,
  placementStatusCell,
  placementSummary,
  renderKeyworkersRadioOptions,
  requirementsInformation,
  sortSpaceBookingsByCanonicalArrivalDate,
  withdrawalMessage,
  withdrawalSummaryList,
  placementName,
} from '.'
import { DateFormats } from '../dateUtils'

import paths from '../../paths/manage'
import { characteristicsBulletList } from '../characteristicsUtils'
import * as applicationHelpers from '../applications/helpers'
import { detailedStatus, statusTextMap } from './status'

describe('placementUtils', () => {
  describe('placementStatusHtml', () => {
    it('should return an appealRequested status', () => {
      const placement = cas1SpaceBookingSummaryFactory.build({ openChangeRequestTypes: ['placementAppeal'] })
      const expectedStatusText = statusTextMap[detailedStatus(placement)]
      expect(placementStatusCell(placement)).toEqual({ html: `${expectedStatusText}<br/>Appeal requested` })
    })
    it('should return an transfer requested status', () => {
      const placement = cas1SpaceBookingSummaryFactory.build({ openChangeRequestTypes: ['plannedTransfer'] })
      const expectedStatusText = statusTextMap[detailedStatus(placement)]
      expect(placementStatusCell(placement)).toEqual({ html: `${expectedStatusText}<br/>Transfer requested` })
    })
  })

  describe('canonicalDates', () => {
    describe.each([
      ['placement summary', cas1SpaceBookingSummaryFactory],
      ['full placement', cas1SpaceBookingFactory],
    ])('when passed a %s', (_, typeFactory) => {
      it('returns the actual arrival and departure if they are defined', () => {
        const placement = typeFactory.departed().build()

        expect(canonicalDates(placement)).toEqual({
          arrivalDate: placement.actualArrivalDate,
          departureDate: placement.actualDepartureDate,
        })
      })

      it('returns the expected arrival and departure if actual dates are not defined', () => {
        const placement = typeFactory.upcoming().build()

        expect(canonicalDates(placement)).toEqual({
          arrivalDate: placement.expectedArrivalDate,
          departureDate: placement.expectedDepartureDate,
        })
      })
    })
  })

  describe('actions', () => {
    const userDetails = userDetailsFactory.build({
      permissions: [
        'cas1_space_booking_record_arrival',
        'cas1_space_booking_record_departure',
        'cas1_space_booking_record_keyworker',
        'cas1_space_booking_record_non_arrival',
        'cas1_transfer_create',
        'cas1_space_booking_create',
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
      href: paths.premises.placements.keyworker.new({ premisesId: premises.id, placementId }),
      text: 'Edit keyworker',
    }
    const requestTransferOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.transfers.new({ premisesId: premises.id, placementId }),
      text: 'Request a transfer',
    }
    const changePlacementOption = {
      classes: 'govuk-button--secondary',
      href: paths.premises.placements.changes.new({ premisesId: premises.id, placementId }),
      text: 'Change placement',
    }

    describe('when the placement is in its initial state', () => {
      const placementInitial = cas1SpaceBookingFactory.upcoming().build({ id: placementId, premises })

      it('should allow arrivals, non-arrivals, assigning a keyworker and changing the placement', () => {
        expect(actions(placementInitial, userDetails)).toEqual(
          wrapOptions([keyworkerOption, arrivalOption, nonArrivalOption, changePlacementOption]),
        )
      })

      it('should require correct permissions for arrival, non-arrival, assigning a keyworker and changing the placement', () => {
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
        expect(
          actions(
            placementInitial,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_create'],
            }),
          ),
        ).toEqual(wrapOptions([changePlacementOption]))
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

      it('should allow nothing if the user does not have the relevant permissions', () => {
        expect(actions(placementAfterArrival, userDetailsFactory.build({ permissions: [] }))).toEqual(null)
      })

      it('should allow recording a departure, assigning a keyworker, requesting a transfer and changing the placement', () => {
        expect(actions(placementAfterArrival, userDetails)).toEqual([
          { items: [keyworkerOption, departureOption, requestTransferOption, changePlacementOption] },
        ])
      })

      it('should require correct permissions for recording a departure', () => {
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_record_departure'],
            }),
          ),
        ).toEqual([{ items: [departureOption] }])
      })

      it('should require the correct permission for requesting a transfer', () => {
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: ['cas1_transfer_create'],
            }),
          ),
        ).toEqual([{ items: [requestTransferOption] }])
      })

      it('should require the correct permission for changing the placement', () => {
        expect(
          actions(
            placementAfterArrival,
            userDetailsFactory.build({
              permissions: ['cas1_space_booking_create'],
            }),
          ),
        ).toEqual([{ items: [changePlacementOption] }])
      })
    })

    describe('when the placement has both an arrival and a departure recorded', () => {
      const placementAfterDeparture = cas1SpaceBookingFactory.departed().build({ id: placementId, premises })

      it('should allow nothing', () => {
        expect(actions(placementAfterDeparture, userDetails)).toEqual(null)
      })
    })

    describe('when the placement has been cancelled', () => {
      const placementCancelled = cas1SpaceBookingFactory.cancelled().build({ id: placementId, premises })

      it('should allow nothing', () => {
        expect(actions(placementCancelled, userDetails)).toEqual(null)
      })
    })
  })

  describe('placementKeyDetails', () => {
    it('calls personKeyDetails with person and tier', () => {
      jest.spyOn(applicationHelpers, 'personKeyDetails')

      const placement = cas1SpaceBookingFactory.build()

      placementKeyDetails(placement)

      expect(applicationHelpers.personKeyDetails).toHaveBeenCalledWith(placement.person, placement.tier)
    })
  })

  describe('placementName', () => {
    it('renders the placement title with premises name and arrival date', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build({
        premises: {
          name: "St John's House",
        },
        expectedArrivalDate: '2026-02-13',
      })

      expect(placementName(spaceBooking)).toEqual(`St John's House from Fri 13 Feb 2026`)
    })
  })

  describe('placementStatusTag', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-02-10'))
    })

    it.each([
      ['Arriving within 2 weeks', 'arrivingWithin2Weeks', '2026-02-13', 'blue'],
      ['Arriving today', 'arrivingToday', '2026-02-10', 'blue'],
      ['Overdue arrival', 'overdueArrival', '2026-02-07', 'red'],
    ])('renders the detailed status for a placement %s', (label, status, date, colour) => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build({
        expectedArrivalDate: date,
      })

      expect(placementStatusTag(spaceBooking)).toEqual(
        `<strong class="govuk-tag govuk-tag--${colour} govuk-tag--nowrap " data-cy-status="${status}" >${label}</strong>`,
      )
    })

    it('accepts optional status tag options', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.departed().build()

      expect(placementStatusTag(spaceBooking, { classes: 'some-class', id: 'some-id' })).toEqual(
        `<strong class="govuk-tag govuk-tag--grey govuk-tag--nowrap some-class" data-cy-status="departed" id="some-id-status">Departed</strong>`,
      )
    })
  })

  describe('tabular information', () => {
    const placement = cas1SpaceBookingFactory.build({
      expectedArrivalDate: '2024-05-30',
      expectedDepartureDate: '2024-12-24',
      actualArrivalDate: '2024-06-01',
      actualDepartureDate: '2024-12-25',
      createdAt: '2024-03-03',
      characteristics: ['isESAP', 'acceptsNonSexualChildOffenders', 'hasEnSuite'],
    })

    it('should return the placement summary information', () => {
      expect(placementSummary(placement)).toEqual({
        rows: [
          { key: { text: 'AP name' }, value: { text: placement.premises.name } },
          { key: { text: 'Date allocated' }, value: { text: DateFormats.isoDateToUIDate(placement.createdAt) } },
          { key: { text: 'Status' }, value: { html: placementStatusTag(placement) } },
          {
            key: { text: 'Actual length of stay' },
            value: { text: '29 weeks, 4 days' },
          },
          { key: { text: 'Key worker' }, value: { text: placement.keyWorkerAllocation?.name } },
          { key: { text: 'Delius Event Number' }, value: { text: placement.deliusEventNumber } },
        ],
      })
    })

    describe('Overview placement summary', () => {
      it('should return an overview of the placement summary information before arrival', () => {
        const unarrivedPlacement: Cas1SpaceBooking = {
          ...placement,
          actualArrivalDate: undefined,
          actualDepartureDate: undefined,
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
      const arrivedPlacement = cas1SpaceBookingFactory.current().build()

      expect(arrivalInformation(arrivedPlacement)).toEqual({
        rows: [
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(arrivedPlacement.expectedArrivalDate) },
          },
          {
            key: { text: 'Actual arrival date' },
            value: { text: DateFormats.isoDateToUIDate(arrivedPlacement.actualArrivalDate) },
          },
          {
            key: { text: 'Arrival time' },
            value: { text: arrivedPlacement.actualArrivalTime },
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
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDate) },
            },
            {
              key: { text: 'Departure time' },
              value: { text: departedPlacement.actualDepartureTime },
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
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDate) },
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
              value: { text: DateFormats.isoDateToUIDate(departedPlacement.actualDepartureDate) },
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
              value: {
                html: characteristicsBulletList(['acceptsChildSexOffenders', 'acceptsNonSexualChildOffenders']),
              },
            },
            { key: { text: 'Room requirements' }, value: { html: characteristicsBulletList(['hasEnSuite']) } },
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
              value: { html: characteristicsBulletList(['acceptsChildSexOffenders']) },
            },
            {
              key: { text: 'Room requirements' },
              value: { html: characteristicsBulletList(['hasEnSuite', 'isWheelchairAccessible']) },
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

  describe('renderKeyworkersRadioOptions', () => {
    it('should return a list of current keyworkers', () => {
      const currentKeyworkers = cas1CurrentKeyworkerFactory.buildList(1)

      expect(renderKeyworkersRadioOptions(currentKeyworkers)).toEqual([
        { text: currentKeyworkers[0].summary.name, value: currentKeyworkers[0].summary.id },
        { divider: 'or' },
        { text: 'Assign a different keyworker', value: 'new' },
      ])
    })

    it('should exclude the currently assigned keyworker', () => {
      const user = userSummaryFactory.build()
      const currentKeyworkers = [
        cas1CurrentKeyworkerFactory.build({ summary: user }),
        cas1CurrentKeyworkerFactory.build(),
      ]
      const placement = cas1SpaceBookingFactory.build({
        keyWorkerAllocation: cas1KeyworkerAllocationFactory.build({ ...user, userId: user.id }),
      })

      expect(renderKeyworkersRadioOptions(currentKeyworkers, placement)).toEqual([
        { text: currentKeyworkers[1].summary.name, value: currentKeyworkers[1].summary.id },
        { divider: 'or' },
        { text: 'Assign a different keyworker', value: 'new' },
      ])
    })

    it('does not render the divider if there are no current keyworkers', () => {
      expect(renderKeyworkersRadioOptions([])).toEqual([{ text: 'Assign a different keyworker', value: 'new' }])
    })
  })

  describe('injectRadioConditionalHtml', () => {
    it('should inject the supplied html into the radio list as a conditional', () => {
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

  describe('withdrawal utilities', () => {
    const placement = cas1SpaceBookingFactory.build({
      premises: { name: 'premises-name' },
      actualArrivalDate: '2024-01-20',
      expectedDepartureDate: '2024-11-04',
      actualDepartureDate: undefined,
    })
    describe('withdrawalMessage', () => {
      it('should return the placement withdrawal confirmation message', () => {
        expect(withdrawalMessage(placement)).toEqual(
          'Placement at premises-name from 20 Jan 2024 to 4 Nov 2024 has been withdrawn',
        )
      })
    })

    describe('withdrawalSummaryList', () => {
      it('should generate the summary list for the withdrawl confirmation page', () => {
        expect(withdrawalSummaryList(placement)).toEqual({
          rows: [
            { key: { text: 'Approved premises' }, value: { text: 'premises-name' } },
            { key: { text: 'Arrival date' }, value: { text: 'Sat 20 Jan 2024' } },
            { key: { text: 'Departure date' }, value: { text: 'Mon 4 Nov 2024' } },
          ],
        })
      })
    })
  })

  describe('sortSpaceBookingsByCanonicalArrivalDate', () => {
    it('should sort bookings by canonical arrival date in descending order', () => {
      const booking1 = cas1SpaceBookingShortSummaryFactory.build({
        expectedArrivalDate: '2024-01-15',
        actualArrivalDate: undefined,
      })
      const booking2 = cas1SpaceBookingShortSummaryFactory.build({
        expectedArrivalDate: '2024-03-20',
        actualArrivalDate: undefined,
      })
      const booking3 = cas1SpaceBookingShortSummaryFactory.build({
        expectedArrivalDate: '2024-02-10',
        actualArrivalDate: undefined,
      })

      const result = sortSpaceBookingsByCanonicalArrivalDate([booking1, booking2, booking3])

      expect(result[0].id).toBe(booking2.id)
      expect(result[1].id).toBe(booking3.id)
      expect(result[2].id).toBe(booking1.id)
    })

    it('should use actualArrivalDate when available', () => {
      const booking1 = cas1SpaceBookingShortSummaryFactory.build({
        expectedArrivalDate: '2024-01-15',
        actualArrivalDate: '2024-04-01',
      })
      const booking2 = cas1SpaceBookingShortSummaryFactory.build({
        expectedArrivalDate: '2024-03-20',
        actualArrivalDate: undefined,
      })

      const result = sortSpaceBookingsByCanonicalArrivalDate([booking1, booking2])

      expect(result[0].id).toBe(booking1.id)
      expect(result[1].id).toBe(booking2.id)
    })

    it('should return empty array when given empty array', () => {
      const result = sortSpaceBookingsByCanonicalArrivalDate([])
      expect(result).toEqual([])
    })
  })
})
