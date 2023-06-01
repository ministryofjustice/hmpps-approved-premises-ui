import AccessNeeds from './accessNeeds'
import AccessNeedsFurtherQuestions from './accessNeedsFurtherQuestions'
import Covid from './covid'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Add access, cultural and healthcare needs',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsFurtherQuestions, Covid],
})
export default class AccessAndHealthcare {}
