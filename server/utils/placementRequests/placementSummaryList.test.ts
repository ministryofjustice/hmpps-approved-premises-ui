import { TextItem } from '@approved-premises/ui'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { placementsSummaries, placementSummaryList } from './placementSummaryList'
import { DateFormats } from '../dateUtils'
import { placementNameWithStatus } from '../placements'
import cas1SpaceBookingSummaryFactory from '../../testutils/factories/cas1SpaceBookingSummary'
import { characteristicsBulletList } from '../characteristicsUtils'
import { filterApLevelCriteria, filterRoomLevelCriteria } from '../match/spaceSearch'

describe('placement summary list', () => {
  describe('placementSummaryList', () => {
    it('renders a summary list for a placement', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()

      expect(placementSummaryList(spaceBooking)).toEqual({
        rows: [
          { key: { text: 'Approved Premises' }, value: { text: spaceBooking.premises.name } },
          {
            key: { text: 'Date of booking' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.createdAt) },
          },
          {
            key: { text: 'Expected arrival date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedArrivalDate) },
          },
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedDepartureDate) },
          },
          {
            key: { text: 'AP requirements' },
            value: {
              html: characteristicsBulletList(filterApLevelCriteria(spaceBooking.characteristics)),
            },
          },
          {
            key: { text: 'Room requirements' },
            value: {
              html: characteristicsBulletList(filterRoomLevelCriteria(spaceBooking.characteristics)),
            },
          },
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

    it('renders the actual arrival date and expected departure date if the booking is current', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.current().build()

      expect(placementSummaryList(spaceBooking).rows).toEqual(
        expect.arrayContaining([
          {
            key: { text: 'Actual arrival date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.actualArrivalDate) },
          },
          {
            key: { text: 'Expected departure date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedDepartureDate) },
          },
        ]),
      )
    })

    it('renders the actual arrival and departure date if the booking is departed', () => {
      const spaceBooking = cas1SpaceBookingSummaryFactory.departed().build()

      expect(placementSummaryList(spaceBooking).rows).toEqual(
        expect.arrayContaining([
          {
            key: { text: 'Actual arrival date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.actualArrivalDate) },
          },
          {
            key: { text: 'Actual departure date' },
            value: { text: DateFormats.isoDateToUIDate(spaceBooking.actualDepartureDate) },
          },
        ]),
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
          title: placementNameWithStatus(booking1),
          summaryList: placementSummaryList(booking1),
        },
        {
          title: placementNameWithStatus(booking2),
          summaryList: placementSummaryList(booking2),
        },
        {
          title: placementNameWithStatus(booking3),
          summaryList: placementSummaryList(booking3),
        },
      ])
    })
  })
})
