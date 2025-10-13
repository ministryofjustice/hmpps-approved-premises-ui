import { TextItem } from '@approved-premises/ui'
import { cas1PlacementRequestDetailFactory } from '../../testutils/factories'
import { placementsSummaries, placementSummaryList } from './placementSummaryList'
import { DateFormats } from '../dateUtils'
import { placementNameWithStatus } from '../placements'
import cas1SpaceBookingSummaryFactory from '../../testutils/factories/cas1SpaceBookingSummary'
import { detailedStatus, statusTextMap } from '../placements/status'

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
