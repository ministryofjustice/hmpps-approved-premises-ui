import type { TaskListErrors } from '@approved-premises/ui'
import type { Cas1Assessment as Assessment } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'check-your-answers', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'check-your-answers'

  title = 'Check your answers'

  constructor(
    public body: { reviewed?: string },
    readonly assessment: Assessment,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
