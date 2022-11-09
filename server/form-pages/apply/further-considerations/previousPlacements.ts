import type { TaskListErrors, YesNoOrIDKWithDetail } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { yesNoOrDontKnowResponseWithDetail } from '../../utils'

export const questionKeys = ['previousPlacement'] as const

type QuestionKeys = typeof questionKeys[number]

export default class PreviousPlacements implements TasklistPage {
  name = 'previous-placements'

  title = 'Previous placements'

  body: YesNoOrIDKWithDetail<'previousPlacement'>

  questionPredicates = {
    previousPlacement: `stayed or been offered a placement in an AP before`,
  }

  questions = {
    previousPlacement: `Has ${this.application.person.name} ${this.questionPredicates.previousPlacement}?`,
  }

  hints = {
    previousPlacement: "You may be able to find this information in the person's case notes.",
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      previousPlacement: body.previousPlacement,
      previousPlacementDetail: body.previousPlacementDetail,
    } as YesNoOrIDKWithDetail<'previousPlacement'>
  }

  previous() {
    return 'vulnerability'
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    response[this.questions.previousPlacement] = yesNoOrDontKnowResponseWithDetail<QuestionKeys>(
      'previousPlacement',
      this.body,
    )

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.previousPlacement) {
      errors.previousPlacement = `You must specify if ${this.application.person.name} has ${this.questionPredicates.previousPlacement}`
    }

    if (this.body.previousPlacement === 'yes' && !this.body.previousPlacementDetail) {
      errors.previousPlacementDetail = `You must specify details about if ${this.application.person.name} has ${this.questionPredicates.previousPlacement}`
    }

    return errors
  }
}
