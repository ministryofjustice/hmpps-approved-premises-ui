import { Cas1SpaceBooking, Cas1SpaceBookingSummary } from '@approved-premises/api'
import Page from '../page'
import { withdrawalMessage } from '../../../server/utils/placements'

export default class PlacementRequestPage extends Page {
  constructor() {
    super('Placement request')
  }

  shouldShowWithdrawalBanner(placement: Cas1SpaceBooking | Cas1SpaceBookingSummary) {
    this.shouldShowBanner(withdrawalMessage(placement))
  }
}
