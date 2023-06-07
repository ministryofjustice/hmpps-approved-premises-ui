import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'
import { PlacementApplication } from '../../../@types/shared'

@Page({ name: 'check-your-answers', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'check-your-answers'

  title = 'Check your answers'

  placementApplication: PlacementApplication

  constructor(public body: { reviewed?: string }, placementApplication: PlacementApplication) {
    this.placementApplication = placementApplication
  }

  previous() {
    return 'updates-to-application'
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
