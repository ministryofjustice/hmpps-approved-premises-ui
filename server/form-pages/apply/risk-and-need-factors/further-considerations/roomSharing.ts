import type { PageResponse, TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForYes } from '../../../utils'

export const questionKeys = [
  'riskToStaff',
  'riskToOthers',
  'sharingConcerns',
  'traumaConcerns',
  'sharingBenefits',
] as const

type QuestionKeys = (typeof questionKeys)[number]

type RoomSharingBody = YesOrNoWithDetail<'riskToStaff'> &
  YesOrNoWithDetail<'riskToOthers'> &
  YesOrNoWithDetail<'sharingConcerns'> &
  YesOrNoWithDetail<'traumaConcerns'> &
  YesOrNoWithDetail<'sharingBenefits'>
@Page({
  name: 'room-sharing',
  bodyProperties: [
    'riskToStaff',
    'riskToStaffDetail',
    'riskToOthers',
    'riskToOthersDetail',
    'sharingConcerns',
    'sharingConcernsDetail',
    'traumaConcerns',
    'traumaConcernsDetail',
    'sharingBenefits',
    'sharingBenefitsDetail',
  ],
})
export default class RoomSharing implements TasklistPage {
  name = 'room-sharing'

  title = 'Room sharing'

  questionPredicates = {
    riskToStaff: 'any evidence that the person may pose a risk to AP staff',
    riskToOthers: 'any evidence that the person may pose a risk to other AP residents',
    sharingConcerns: 'any concerns about the person sharing a bedroom',
    traumaConcerns:
      'any evidence of previous trauma or significant event in the persons history which would indicate that room share may not be suitable',
    sharingBenefits: 'potential for the person to benefit from a room share',
  }

  questions = {
    riskToStaff: `Is there ${this.questionPredicates.riskToStaff}?`,
    riskToOthers: `Is there ${this.questionPredicates.riskToOthers}?`,
    sharingConcerns: `Do you have ${this.questionPredicates.sharingConcerns}?`,
    traumaConcerns: `Is there ${this.questionPredicates.traumaConcerns}?`,
    sharingBenefits: `Is there ${this.questionPredicates.sharingBenefits}?`,
  }

  hints = {
    traumaConcerns: { text: 'For example, a survivor of sexual abuse or violence or a witness of suicide in custody.' },
  }

  constructor(public body: Partial<RoomSharingBody>) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return 'vulnerability'
  }

  response() {
    const response: PageResponse = {}

    questionKeys.forEach((k: QuestionKeys) => {
      response[this.questions[k]] = yesOrNoResponseWithDetailForYes<QuestionKeys>(k, this.body)
    })

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    questionKeys.forEach(question => {
      if (!this.body[question]) {
        errors[question] = `You must specify if there is ${this.questionPredicates[question]}`
      }

      if (this.body[question] === 'yes' && !this.body[`${question}Detail`]) {
        errors[`${question}Detail`] = `You must specify details about ${this.questionPredicates[question]}`
      }
    })

    return errors
  }
}
