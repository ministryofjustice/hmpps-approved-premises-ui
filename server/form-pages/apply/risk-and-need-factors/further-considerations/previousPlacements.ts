import type { PageResponse, TaskListErrors, YesNoOrIDKWithDetail } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesNoOrDontKnowResponseWithDetail } from '../../../utils'

export const questionKeys = ['previousPlacement'] as const

type QuestionKeys = (typeof questionKeys)[number]

@Page({ name: 'previous-placements', bodyProperties: ['previousPlacement', 'previousPlacementDetail'] })
export default class PreviousPlacements implements TasklistPage {
  name = 'previous-placements'

  title = 'Previous Approved Premises (AP) placements'

  questionPredicates = {
    previousPlacement: `stayed or been offered a placement in an AP before`,
  }

  questions = {
    previousPlacement: `Has the person ${this.questionPredicates.previousPlacement}?`,
  }

  hints = {
    previousPlacement: { text: "You may be able to find this information in the person's case notes." },
  }

  constructor(public body: Partial<YesNoOrIDKWithDetail<'previousPlacement'>>) {}

  previous() {
    return 'vulnerability'
  }

  next() {
    return 'catering'
  }

  response() {
    const response: PageResponse = {}

    response[this.questions.previousPlacement] = yesNoOrDontKnowResponseWithDetail<QuestionKeys>(
      'previousPlacement',
      this.body,
    )

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.previousPlacement) {
      errors.previousPlacement = `You must specify if the person has ${this.questionPredicates.previousPlacement}`
    }

    if (this.body.previousPlacement === 'yes' && !this.body.previousPlacementDetail) {
      errors.previousPlacementDetail = `You must specify details about if the person has ${this.questionPredicates.previousPlacement}`
    }

    return errors
  }
}
