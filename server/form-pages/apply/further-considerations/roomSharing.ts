import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'

export const questionKeys = [
  'riskToStaff',
  'riskToOthers',
  'sharingConcerns',
  'traumaConcerns',
  'sharingBenefits',
] as const

type QuestionKeys = typeof questionKeys[number]

type YesOrNoWithDetail<T extends QuestionKeys> = {
  [K in T]: YesOrNo
} & {
  [K in `${T}Detail`]: string
}

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
    traumaConcerns: 'For example, a survivor of sexual abuse or violence or a witness of suicide in custody.',
  }

  body: YesOrNoWithDetail<'riskToStaff'> &
    YesOrNoWithDetail<'riskToOthers'> &
    YesOrNoWithDetail<'sharingConcerns'> &
    YesOrNoWithDetail<'traumaConcerns'> &
    YesOrNoWithDetail<'sharingBenefits'>

  constructor(body: Record<string, unknown>) {
    this.body = {
      ...this.applyYesOrNo('riskToStaff', body),
      ...this.applyYesOrNo('riskToOthers', body),
      ...this.applyYesOrNo('sharingConcerns', body),
      ...this.applyYesOrNo('traumaConcerns', body),
      ...this.applyYesOrNo('sharingBenefits', body),
    }
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    questionKeys.forEach((k: string) => {
      response[this.questions[k]] = this.body[k] === 'yes' ? `Yes - ${this.body[`${k}Detail`]}` : 'No'
    })

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    questionKeys.forEach((question: string) => {
      if (!this.body[question]) {
        errors[question] = `You must specify if there is ${this.questionPredicates[question]}`
      }

      if (this.body[question] === 'yes' && !this.body[`${question}Detail`]) {
        errors[`${question}Detail`] = `You must specify details about ${this.questionPredicates[question]}`
      }
    })

    return errors
  }

  private applyYesOrNo<K extends QuestionKeys>(key: K, body: Record<string, unknown>): YesOrNoWithDetail<K> {
    return {
      [`${key}`]: body[`${key}`] as YesOrNo,
      [`${key}Detail`]: body[`${key}Detail`] as string,
    } as YesOrNoWithDetail<K>
  }
}
