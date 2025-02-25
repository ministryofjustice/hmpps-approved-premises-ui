import { Factory } from 'fishery'
import { PlacementRequestDetail } from '../../@types/shared'

import cancellationFactory from './cancellation'
import { placementRequestFactory } from './placementRequest'
import applicationFactory from './application'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import bookingSummaryFactory from './placementRequestBookingSummary'

export default Factory.define<PlacementRequestDetail>(() => {
  const spaceBooking = cas1SpaceBookingSummaryFactory.build()
  const bookingSummary = bookingSummaryFactory.fromSpaceBooking(spaceBooking).build()

  return {
    ...placementRequestFactory.build(),
    cancellations: cancellationFactory.buildList(2),
    booking: bookingSummary,
    legacyBooking: undefined,
    spaceBookings: [spaceBooking],
    application: applicationFactory.build(),
  }
})
