import type { TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'review', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'review'

  title = 'Check your answers'

  constructor(public body: { reviewed?: string }, readonly application: Application) {}

  previous() {
    return ''
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
