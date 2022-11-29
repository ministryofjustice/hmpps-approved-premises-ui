// eslint-disable-next-line max-classes-per-file
import AccessNeeds from './accessNeeds'
import AccessNeedsMobility from './accessNeedsMobility'
import Covid from './covid'
import AccessNeedsAdditionalAdjustments from './accessNeedsAdditionalAdjustments'
import { Task } from '../../utils/decorators'

export default {
  'access-needs': AccessNeeds,
  'access-needs-mobility': AccessNeedsMobility,
  covid: Covid,
  'access-needs-additional-adjustments': AccessNeedsAdditionalAdjustments,
}

@Task({
  name: 'Provide access and healthcare information',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsMobility, Covid, AccessNeedsAdditionalAdjustments],
})
export class AccessAndHealthcare {}
