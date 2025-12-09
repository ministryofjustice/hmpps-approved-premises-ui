import { createMock } from '@golevelup/ts-jest'
import { placementSideNavigation, placementPreviousApStaysTabController, previousApStaysCards } from './placement'
import { PlacementSubTab } from './index'
import { cas1SpaceBookingFactory } from '../../testutils/factories'
import { summaryListItem, summaryListItemNoBlankRows } from '../formUtils'
import PersonService from '../../services/personService'

describe('placement', () => {
  describe('placementSideNavigation', () => {
    it('builds the side navigation for the placement tab', () => {
      const subTab: PlacementSubTab = 'placement-details'
      const placement = cas1SpaceBookingFactory.build()
      const crn = 'B1663R'
      const basePath = `/manage/resident/${crn}/placement/${placement.id}/placement/`

      expect(placementSideNavigation(subTab, crn, placement.id)).toEqual([
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
      const bookings = cas1SpaceBookingFactory.departed().buildList(2)
      const currentPlacementId = 'current-placement-id'

      const cards = previousApStaysCards(bookings, currentPlacementId)

      expect(cards).toHaveLength(2)
      expect(cards[0].card.title.text).toEqual(bookings[0].premises.name)

      expect(cards[0].rows).toEqual([
        summaryListItem('Arrival date', bookings[0].actualArrivalDate, 'date'),
        summaryListItem('Departure date', bookings[0].actualDepartureDate, 'date'),
        summaryListItemNoBlankRows('Departure reason', bookings[0].departure?.reason?.name, 'textBlock'),
        summaryListItemNoBlankRows('Departure reason notes', bookings[0].departure?.notes, 'textBlock'),
      ])
    })

    it('should render expected date labels when actual dates are not available', () => {
      const booking = cas1SpaceBookingFactory.upcoming().build()
      const currentPlacementId = 'current-placement-id'

      const cards = previousApStaysCards([booking], currentPlacementId)

      expect(cards[0].rows).toEqual([
        summaryListItem('Expected arrival date', booking.expectedArrivalDate, 'date'),
        summaryListItem('Expected departure date', booking.expectedDepartureDate, 'date'),
      ])
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
        actualArrivalDate: '2023-01-01',
        expectedArrivalDate: '2023-01-01',
      })
      const newerPlacement = cas1SpaceBookingFactory.build({
        actualArrivalDate: undefined,
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
      expect(rowKeys).toContain('Expected departure date')
      expect(rowKeys).toContain('Non-arrival reason')
      expect(rowKeys).toContain('Non-arrival notes')
      expect(rowKeys).not.toContain('Departure reason')
      expect(rowKeys).not.toContain('Actual departure date')

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

  describe('placementPreviousApStaysTabController', () => {
    const token = 'SOME_TOKEN'
    const crn = 'B1663R'
    const placementId = 'current-placement-id'

    let personService: jest.Mocked<PersonService>

    beforeEach(() => {
      personService = createMock<PersonService>({})
    })

    it('should call personService.getSpaceBookings with correct parameters', async () => {
      const bookings = cas1SpaceBookingFactory.buildList(2)
      personService.getSpaceBookings.mockResolvedValue(bookings)

      await placementPreviousApStaysTabController({
        personService,
        token,
        crn,
        placementId,
      })

      expect(personService.getSpaceBookings).toHaveBeenCalledWith(token, crn, false)
    })

    it('should call personService.getSpaceBookings with includeCancelled=true when specified', async () => {
      const bookings = cas1SpaceBookingFactory.buildList(2)
      personService.getSpaceBookings.mockResolvedValue(bookings)

      await placementPreviousApStaysTabController({
        personService,
        token,
        crn,
        placementId,
        includeCancelled: true,
      })

      expect(personService.getSpaceBookings).toHaveBeenCalledWith(token, crn, true)
    })

    it('should return TabData with correct subHeading and cardList', async () => {
      const currentPlacement = cas1SpaceBookingFactory.build({ id: placementId })
      const otherPlacement = cas1SpaceBookingFactory.departed().build({ id: 'other-placement-id' })
      const bookings = [currentPlacement, otherPlacement]

      personService.getSpaceBookings.mockResolvedValue(bookings)

      const result = await placementPreviousApStaysTabController({
        personService,
        token,
        crn,
        placementId,
      })

      expect(result).toEqual({
        subHeading: 'Previous AP stays',
        cardList: previousApStaysCards(bookings, placementId),
      })
    })

    it('should return empty cardList when no bookings exist', async () => {
      personService.getSpaceBookings.mockResolvedValue([])

      const result = await placementPreviousApStaysTabController({
        personService,
        token,
        crn,
        placementId,
      })

      expect(result).toEqual({
        subHeading: 'Previous AP stays',
        cardList: [],
      })
    })

    it('should filter out current placement from cardList', async () => {
      const currentPlacement = cas1SpaceBookingFactory.build({ id: placementId })
      const otherPlacement = cas1SpaceBookingFactory.departed().build({ id: 'other-placement-id' })
      const bookings = [currentPlacement, otherPlacement]

      personService.getSpaceBookings.mockResolvedValue(bookings)

      const result = await placementPreviousApStaysTabController({
        personService,
        token,
        crn,
        placementId,
      })

      expect(result.cardList).toHaveLength(1)
      expect(result.cardList[0].card.title.text).toEqual(otherPlacement.premises.name)
    })
  })
})
