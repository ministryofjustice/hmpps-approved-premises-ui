import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'

export default class PlacementDuration implements TasklistPage {
  name = 'placement-duration'

  title = 'Placement duration and move on'

  body: {
    duration: number
    durationDetail: string
  }

  questions = {
    duration: 'What duration of placement do you recommend?',
    durationDetail: 'Provide any additional information',
  }

  constructor(body: Record<string, unknown>) {
    this.body = {
      duration: body.duration as number,
      durationDetail: body.durationDetail as string,
    }
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {
      [this.questions.duration]: `${this.body.duration} weeks`,
    }

    if (this.body.durationDetail) {
      response[this.questions.durationDetail] = this.body.durationDetail
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.duration) {
      errors.duration = 'You must specify the duration of the placement'
    }

    return errors
  }
}
