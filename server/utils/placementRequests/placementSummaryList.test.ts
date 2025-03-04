import { TextItem } from '@approved-premises/ui'
import { placementRequestDetailFactory } from '../../testutils/factories'
import { placementSummaryList } from './placementSummaryList'
import { DateFormats } from '../dateUtils'
import { detailedStatus, statusTextMap } from '../placements'
import cas1SpaceBookingSummaryFactory from '../../testutils/factories/cas1SpaceBookingSummary'

describe('placement summary list', () => {
  it('renders a summary list for a placement request with an upcoming space booking', () => {
    const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
    const placementRequestDetail = placementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

    expect(placementSummaryList(placementRequestDetail)).toEqual({
      rows: [
        { key: { text: 'Approved Premises' }, value: { text: spaceBooking.premises.name } },
        {
          key: { text: 'Date of match' },
          value: { text: DateFormats.isoDateToUIDate(placementRequestDetail.booking.createdAt) },
        },
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

  it('renders the actual arrival date for a current booking', () => {
    const spaceBooking = cas1SpaceBookingSummaryFactory.current().build()
    const placementRequestDetail = placementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

    const result = placementSummaryList(placementRequestDetail)

    expect(result.rows).toEqual(
      expect.arrayContaining([
        {
          key: { text: 'Actual arrival date' },
          value: { text: DateFormats.isoDateToUIDate(spaceBooking.actualArrivalDate) },
        },
      ]),
    )
    expect(result.rows).not.toEqual(
      expect.arrayContaining([
        {
          key: { text: 'Expected arrival date' },
          value: { text: DateFormats.isoDateToUIDate(spaceBooking.expectedArrivalDate) },
        },
      ]),
    )
  })

  it('does not render the delius event number if not available', () => {
    const spaceBooking = cas1SpaceBookingSummaryFactory.current().build({
      deliusEventNumber: undefined,
    })
    const placementRequestDetail = placementRequestDetailFactory.withSpaceBooking(spaceBooking).build()

    expect(
      placementSummaryList(placementRequestDetail).rows.find(
        row => (row.key as TextItem)?.text === 'Delius event number',
      ),
    ).toBeUndefined()
  })
})
