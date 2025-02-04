import { Factory } from 'fishery'
import { PlacementRequestDetail } from '../../@types/shared'

import cancellationFactory from './cancellation'
import { placementRequestFactory } from './placementRequest'
import bookingSummaryFactory from './placementRequestBookingSummary'
import applicationFactory from './application'

export default Factory.define<PlacementRequestDetail>(() => ({
  ...placementRequestFactory.build(),
  cancellations: cancellationFactory.buildList(2),
  booking: bookingSummaryFactory.build(),
  application: applicationFactory.build(),
}))
