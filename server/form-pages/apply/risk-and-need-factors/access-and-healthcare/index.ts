import AccessNeeds from './accessNeeds'
import AccessNeedsFurtherQuestions from './accessNeedsFurtherQuestions'
import Pregnancy from './pregnancy'
import AccessNeedsAdditionalDetails from './accessNeedsAdditionalDetails'
import Covid from './covid'

import { Task } from '../../../utils/decorators'

@Task({
  name: 'Add access, cultural and healthcare needs',
  slug: 'access-and-healthcare',
  pages: [AccessNeeds, AccessNeedsFurtherQuestions, Pregnancy, AccessNeedsAdditionalDetails, Covid],
})
export default class AccessAndHealthcare {}
