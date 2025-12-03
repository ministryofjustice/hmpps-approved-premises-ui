import {
  placementSideNavigation,
  previousApStaysCards,
  placementDetailsCards,
  applicationCards,
  preArrivalCards,
} from './placement'
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
    it('should render the previous AP stays cards', () => {
      const bookings = cas1SpaceBookingFactory.buildList(2)
      const cards = previousApStaysCards(bookings)

      expect(cards).toHaveLength(2)
      expect(cards[0].card.title.text).toEqual(bookings[0].premises.name)
      const rowKeys = cards[0].rows.map(row => {
        if ('text' in row.key) return row.key.text
        if ('html' in row.key) return row.key.html
        return ''
      })

      expect(rowKeys).toEqual(['Arrival date', 'Departure date', 'Departure reason', 'Departure reason notes'])
    })

    // TODO: This might change in the future (maybe to use a placeholder text for example etc etc)
    it('should not render anything when there is no data', () => {
      expect(previousApStaysCards([])).toEqual([])
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

    it('should return an empty array for preArrivalCards', () => {
      expect(preArrivalCards()).toEqual([])
    })
  })
})
