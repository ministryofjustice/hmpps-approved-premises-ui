import AccessNeeds from './accessNeeds'
import AccessNeedsMobility from './accessNeedsMobility'
import Covid from './covid'
import AccessNeedsAdditionalAdjustments from './accessNeedsAdditionalAdjustments'
import { Task } from '../../../utils/decorators'

@Task({
  name: 'Provide access and healthcare information',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsMobility, Covid, AccessNeedsAdditionalAdjustments],
})
export default class AccessAndHealthcare {}
