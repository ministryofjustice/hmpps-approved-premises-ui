import { Task } from '../../../utils/decorators'

import RequiredActionsPage from './requiredActions'
import { type Pages } from '../../../utils/decorators/task.decorator'

@Task({
  slug: 'required-actions',
  name: 'Provide any requirements to support placement',
  pages: [RequiredActionsPage] as Pages,
})
export default class RequiredActions {}
