import AccessNeeds from './accessNeeds'
import AccessNeedsMobility from './accessNeedsMobility'
import Covid from './covid'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Provide access and healthcare information',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsMobility, Covid],
})
export default class AccessAndHealthcare {}
