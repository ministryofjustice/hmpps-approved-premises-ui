import { Task } from '../../../utils/decorators'

import RequiredActionsPage from './requiredActions'

@Task({
  slug: 'required-actions',
  name: 'Provide any requirements to support placement',
  pages: [RequiredActionsPage],
})
export default class RequiredActions {}
