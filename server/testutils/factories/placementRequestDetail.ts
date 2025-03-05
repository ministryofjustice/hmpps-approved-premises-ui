import { Factory } from 'fishery'
import { Cas1SpaceBookingSummary, PlacementRequestDetail, type PlacementRequestStatus } from '../../@types/shared'

import cancellationFactory from './cancellation'
import placementRequestFactory from './placementRequest'
import applicationFactory from './application'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import bookingSummaryFactory from './placementRequestBookingSummary'

class PlacementRequestDetailFactory extends Factory<PlacementRequestDetail> {
  withLegacyBooking() {
    const legacyBooking = bookingSummaryFactory.build({ type: 'legacy' })
    return this.params({
      booking: legacyBooking,
      legacyBooking,
      spaceBookings: [],
    })
  }

  withSpaceBooking(booking?: Cas1SpaceBookingSummary) {
    const spaceBooking = booking || cas1SpaceBookingSummaryFactory.build()
    const bookingSummary = bookingSummaryFactory.fromSpaceBooking(spaceBooking).build()
    return this.params({
      booking: bookingSummary,
      legacyBooking: undefined,
      spaceBookings: [spaceBooking],
    })
  }
}

export default PlacementRequestDetailFactory.define(({ params }) => {
  const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
  const bookingSummary = bookingSummaryFactory.fromSpaceBooking(spaceBooking).build()

  const skipBooking = (['notMatched', 'unableToMatch'] as Array<PlacementRequestStatus>).includes(params.status)

  return {
    ...placementRequestFactory.build(params),
    cancellations: cancellationFactory.buildList(2),
    booking: skipBooking ? undefined : bookingSummary,
    legacyBooking: undefined,
    spaceBookings: skipBooking ? [] : [spaceBooking],
    application: applicationFactory.build(),
  }
})
