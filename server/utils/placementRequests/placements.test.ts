import { cas1PlacementRequestDetailFactory, cas1SpaceBookingSummaryFactory } from '../../testutils/factories'
import { getPlacementOfStatus } from './placements'

describe('placements utils', () => {
  describe('getPlacementOfStatus', () => {
    it('returns undefined if there are no placements', () => {
      const placementRequest = cas1PlacementRequestDetailFactory.notMatched().build()

      expect(getPlacementOfStatus('arrived', placementRequest)).toBeUndefined()
    })

    it('returns undefined if none of the placements match the required status', () => {
      const departedSpaceBooking = cas1SpaceBookingSummaryFactory.departed().build()
      const upcomingSpaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
      const placementRequest = cas1PlacementRequestDetailFactory.matched().build({
        spaceBookings: [departedSpaceBooking, upcomingSpaceBooking],
      })

      expect(getPlacementOfStatus('arrived', placementRequest)).toBeUndefined()
    })

    it('returns the placement for the given status', () => {
      const departedSpaceBooking = cas1SpaceBookingSummaryFactory.departed().build()
      const arrivedSpaceBooking = cas1SpaceBookingSummaryFactory.current().build()
      const upcomingSpaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
      const placementRequest = cas1PlacementRequestDetailFactory.matched().build({
        spaceBookings: [departedSpaceBooking, upcomingSpaceBooking, arrivedSpaceBooking],
      })

      expect(getPlacementOfStatus('arrived', placementRequest)).toEqual(arrivedSpaceBooking)
    })

    it('returns the first of multiple placements with the same status ordered by expected date of arrival', () => {
      const upcomingSpaceBooking1 = cas1SpaceBookingSummaryFactory.upcoming().build({
        expectedArrivalDate: '2025-12-25',
      })
      const upcomingSpaceBooking2 = cas1SpaceBookingSummaryFactory.upcoming().build({
        expectedArrivalDate: '2026-01-01',
      })

      const placementRequest = cas1PlacementRequestDetailFactory.matched().build({
        spaceBookings: [upcomingSpaceBooking2, upcomingSpaceBooking1],
      })

      expect(getPlacementOfStatus('upcoming', placementRequest)).toEqual(upcomingSpaceBooking1)
    })
  })
})
