import { TransferReason } from '@approved-premises/api'
import { placementSideNavigation, previousApStaysCards, placementDetailsCards, applicationCards } from './placement'
import { PlacementSubTab } from './index'
import { cas1SpaceBookingFactory } from '../../testutils/factories'

describe('placement', () => {
  describe('placementSideNavigation', () => {
    it('builds the side navigation for the placement tab', () => {
      const subTab: PlacementSubTab = 'placement-details'
      const placement = cas1SpaceBookingFactory.build()
      const crn = 'B1663R'
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/placement/`

      expect(placementSideNavigation(subTab, crn, placement.id)).toEqual([
        {
          active: true,
          href: `${basePath}placement-details`,
          text: 'Placement details',
        },
        {
          active: false,
          href: `${basePath}application`,
          text: 'Application',
        },
        {
          active: false,
          href: `${basePath}previous-ap-stays`,
          text: 'Previous AP stays',
        },
      ])
    })
  })

  describe('previousApStaysCards', () => {
    it('should render the previous AP stays cards with actual dates when available', () => {
      const bookings = cas1SpaceBookingFactory.buildList(2, {
        actualArrivalDate: '2024-01-15',
        actualDepartureDate: '2024-03-15',
        additionalInformation: 'Some departure notes',
        transferReason: { id: 'some-id', name: 'Planned move-on' } as unknown as TransferReason,
      })
      const currentPlacementId = 'current-placement-id'

      const cards = previousApStaysCards(bookings, currentPlacementId)

      expect(cards).toHaveLength(2)
      expect(cards[0].card.title.text).toEqual(bookings[0].premises.name)

      const rowKeys = cards[0].rows.map(row => {
        if ('text' in row.key) return row.key.text
        if ('html' in row.key) return row.key.html
        return ''
      })

      expect(rowKeys).toEqual(['Arrival date', 'Departure date', 'Departure reason', 'Departure reason notes'])
    })

    it('should render expected date labels when actual dates are not available', () => {
      const booking = cas1SpaceBookingFactory.build({
        actualArrivalDate: undefined,
        actualDepartureDate: undefined,
        expectedArrivalDate: '2024-01-15',
        expectedDepartureDate: '2024-03-15',
      })
      const currentPlacementId = 'current-placement-id'

      const cards = previousApStaysCards([booking], currentPlacementId)

      const rowKeys = cards[0].rows.map(row => {
        if ('text' in row.key) return row.key.text
        if ('html' in row.key) return row.key.html
        return ''
      })

      expect(rowKeys[0]).toEqual('Expected arrival date')
      expect(rowKeys[1]).toEqual('Expected departure date')
    })

    it('should filter out the current placement', () => {
      const currentPlacement = cas1SpaceBookingFactory.build({ id: 'current-placement-id' })
      const otherPlacement = cas1SpaceBookingFactory.build({ id: 'other-placement-id' })

      const cards = previousApStaysCards([currentPlacement, otherPlacement], 'current-placement-id')

      expect(cards).toHaveLength(1)
      expect(cards[0].card.title.text).toEqual(otherPlacement.premises.name)
    })

    it('should sort bookings by canonical arrival date in descending order', () => {
      const olderPlacement = cas1SpaceBookingFactory.build({
        id: 'older',
        actualArrivalDate: '2023-01-01',
        expectedArrivalDate: '2023-01-01',
      })
      const newerPlacement = cas1SpaceBookingFactory.build({
        id: 'newer',
        actualArrivalDate: '2024-06-01',
        expectedArrivalDate: '2024-06-01',
      })

      const cards = previousApStaysCards([olderPlacement, newerPlacement], 'current-placement-id')

      expect(cards[0].card.title.text).toEqual(newerPlacement.premises.name)
      expect(cards[1].card.title.text).toEqual(olderPlacement.premises.name)
    })

    it('should display non-arrival information when isNonArrival is true', () => {
      const booking = cas1SpaceBookingFactory.nonArrival().build({
        id: 'non-arrival-booking',
        expectedArrivalDate: '2024-02-20',
        nonArrival: {
          reason: { id: 'reason-1', name: 'Person recalled to custody' },
          notes: 'Person was recalled before arrival date',
        },
      })

      const bookingWithIsNonArrival = { ...booking, isNonArrival: true }

      const cards = previousApStaysCards([bookingWithIsNonArrival], 'current-placement-id')

      expect(cards).toHaveLength(1)
      expect(cards[0].card.title.text).toEqual(booking.premises.name)

      const rowKeys = cards[0].rows.map(row => ('text' in row.key ? row.key.text : ''))
      expect(rowKeys).toContain('Expected arrival date')
      expect(rowKeys).toContain('Non-arrival reason')
      expect(rowKeys).toContain('Non-arrival notes')
      expect(rowKeys).not.toContain('Departure reason')
      expect(rowKeys).not.toContain('Departure date')

      const nonArrivalReasonRow = cards[0].rows.find(row => 'text' in row.key && row.key.text === 'Non-arrival reason')
      expect(nonArrivalReasonRow?.value).toEqual({
        html: '<span class="govuk-summary-list__textblock">Person recalled to custody</span>',
      })

      const nonArrivalNotesRow = cards[0].rows.find(row => 'text' in row.key && row.key.text === 'Non-arrival notes')
      expect(nonArrivalNotesRow?.value).toEqual({
        html: '<span class="govuk-summary-list__textblock">Person was recalled before arrival date</span>',
      })
    })

    // TODO: This might change in the future (maybe to use a placeholder text for example etc etc)
    it('should not render anything when there is no data', () => {
      expect(previousApStaysCards([], 'current-placement-id')).toEqual([])
    })
  })

  // TODO: These will be completed in the next PRs. Currently needed to satisfy unit test coverage
  describe('empty card sections', () => {
    it('should return an empty array for placementDetailsCards', () => {
      expect(placementDetailsCards()).toEqual([])
    })

    it('should return an empty array for applicationCards', () => {
      expect(applicationCards()).toEqual([])
    })
  })
})
