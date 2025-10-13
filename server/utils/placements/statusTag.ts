import { StatusTag, StatusTagOptions } from '../statusTag'
import { SpaceBookingStatus, statusTextMap } from './index'

export class PlacementStatusTag extends StatusTag<SpaceBookingStatus> {
  static readonly colours: Record<SpaceBookingStatus, string> = {
    upcoming: 'blue',
    arrived: 'green',
    notArrived: 'red',
    departed: 'grey',
    cancelled: 'red',
    arrivingWithin6Weeks: 'blue',
    arrivingWithin2Weeks: 'blue',
    arrivingToday: 'blue',
    overdueArrival: 'red',
    departingWithin2Weeks: 'green',
    departingToday: 'green',
    overdueDeparture: 'red',
  }

  constructor(status: SpaceBookingStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: statusTextMap,
      colours: PlacementStatusTag.colours,
    })
  }
}
