import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'review', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'review'

  title = 'Review application'

  constructor(public body: { reviewed?: string }, private readonly assessment: Assessment) {}

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

    if (!this.body.reviewed || this.body.reviewed === 'no')
      errors.reviewed = 'You must review all of the application and documents provided before proceeding'

    return errors
  }
}
