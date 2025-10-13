import { TextItem } from '@approved-premises/ui'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { placementsSummaries, placementSummaryList, placementName, placementStatus } from './placementSummaryList'
import { DateFormats } from '../dateUtils'
import { detailedStatus, statusTextMap } from '../placements'
import cas1SpaceBookingSummaryFactory from '../../testutils/factories/cas1SpaceBookingSummary'

describe('placement summary list', () => {
  describe('placementSummaryList', () => {
    it('renders a summary list for a placement', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()

      expect(placementSummaryList(spaceBooking)).toEqual({
        rows: [
          { key: { text: 'Approved Premises' }, value: { text: spaceBooking.premises.name } },
          // TODO: populate this from the spaceBookingSummary createdAt when available
          // {
          //   key: { text: 'Date of match' },
          //   value: { text: DateFormats.isoDateToUIDate(spaceBooking.createdAt) },
          // },
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedArrivalDate) },
          },
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedDepartureDate) },
          },
          { key: { text: 'Status' }, value: { text: statusTextMap[detailedStatus(spaceBooking)] } },
          { key: { text: 'Delius event number' }, value: { text: spaceBooking.deliusEventNumber } },
        ],
      })
    })

    it('does not render the delius event number if not available', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.current().build({
        deliusEventNumber: undefined,
      })

      expect(
        placementSummaryList(spaceBooking).rows.find(row => (row.key as TextItem)?.text === 'Delius event number'),
      ).toBeUndefined()
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

  describe('placementStatus', () => {
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

      expect(placementStatus(spaceBooking)).toEqual(
        `<strong class="govuk-tag govuk-tag--${colour} govuk-!-margin-left-2 govuk-tag--nowrap " data-cy-status="${status}" >${label}</strong>`,
      )
    })
  })

  describe('placementsSummaries', () => {
    it('renders a list of placement summaries ordered by expected arrival date', () => {
      const booking1 = cas1SpaceBookingSummaryFactory.build({
        expectedArrivalDate: '2026-01-19',
      })
      const booking2 = cas1SpaceBookingSummaryFactory.build({
        expectedArrivalDate: '2026-02-01',
      })
      const booking3 = cas1SpaceBookingSummaryFactory.build({
        expectedArrivalDate: '2026-02-10',
      })
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build({
        spaceBookings: [booking3, booking1, booking2],
      })

      expect(placementsSummaries(placementRequestDetail)).toEqual([
        {
          title: `${placementName(booking1)} ${placementStatus(booking1)}`,
          summaryList: placementSummaryList(booking1),
        },
        {
          title: `${placementName(booking2)} ${placementStatus(booking2)}`,
          summaryList: placementSummaryList(booking2),
        },
        {
          title: `${placementName(booking3)} ${placementStatus(booking3)}`,
          summaryList: placementSummaryList(booking3),
        },
      ])
    })
  })
})
