import { Factory } from 'fishery'
import {
  Cas1SpaceBookingSummary,
  PlacementRequestBookingSummary,
  Cas1PlacementRequestDetail,
  PlacementRequestStatus,
  Cas1ChangeRequestSummary,
  Cas1Application,
} from '@approved-premises/api'

import placementRequestFactory from './placementRequest'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import placementRequestBookingSummaryFactory from './placementRequestBookingSummary'

class Cas1PlacementRequestDetailFactory extends Factory<Cas1PlacementRequestDetail> {
  matched() {
    return this.params({
      status: 'matched',
    })
  }

  notMatched() {
    return this.params({
      status: 'notMatched',
    })
  }

  unableToMatch() {
    return this.params({
      status: 'unableToMatch',
    })
  }

  withSpaceBooking(booking?: Cas1SpaceBookingSummary, changeRequest?: Cas1ChangeRequestSummary) {
    const spaceBooking = booking || cas1SpaceBookingSummaryFactory.build()
    const bookingSummary = placementRequestBookingSummaryFactory.fromSpaceBooking(spaceBooking).build()
    return this.params({
      booking: bookingSummary,
      legacyBooking: undefined,
      spaceBookings: [spaceBooking],
      openChangeRequests: changeRequest ? [changeRequest] : [],
    })
  }
}

export default Cas1PlacementRequestDetailFactory.define(({ params }) => {
  const spaceBooking = cas1SpaceBookingSummaryFactory.upcoming().build()
  const bookingSummary = placementRequestBookingSummaryFactory.fromSpaceBooking(spaceBooking).build()

  const skipBooking = (['notMatched', 'unableToMatch'] as Array<PlacementRequestStatus>).includes(params.status)

  return {
    ...placementRequestFactory.build(params),
    booking: skipBooking ? undefined : bookingSummary,
    legacyBooking: undefined as PlacementRequestBookingSummary,
    spaceBookings: skipBooking ? [] : [spaceBooking],
    application: {} as Cas1Application,
    openChangeRequests: [] as Array<Cas1ChangeRequestSummary>,
  }
})
