import AccessNeeds from './accessNeeds'
import AccessNeedsMobility from './accessNeedsMobility'
import Covid from './covid'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Add access, cultural and healthcare needs',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsMobility, Covid],
})
export default class AccessAndHealthcare {}
