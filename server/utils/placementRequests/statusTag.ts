import { RequestForPlacementStatus } from '../../@types/shared'
import { StatusTag, StatusTagOptions } from '../statusTag'

export class RequestForPlacementStatusTag extends StatusTag<RequestForPlacementStatus> {
  static readonly statuses: Record<RequestForPlacementStatus, string> = {
    awaiting_match: 'Awaiting match',
    person_arrived: 'Person arrived',
    person_departed: 'Person departed',
    person_not_arrived: 'Person not arrived',
    placement_booked: 'Placement booked',
    request_rejected: 'Request rejected',
    request_submitted: 'Request submitted',
    request_unsubmitted: 'Request unsubmitted',
    request_withdrawn: 'Request withdrawn',
  }

  static readonly colours: Record<RequestForPlacementStatus, string> = {
    awaiting_match: 'yellow',
    person_arrived: 'blue',
    person_departed: 'blue',
    person_not_arrived: 'red',
    placement_booked: 'blue',
    request_rejected: 'red',
    request_submitted: 'yellow',
    request_unsubmitted: 'yellow',
    request_withdrawn: 'red',
  }

  constructor(status: RequestForPlacementStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: RequestForPlacementStatusTag.statuses,
      colours: RequestForPlacementStatusTag.colours,
    })
  }
}
