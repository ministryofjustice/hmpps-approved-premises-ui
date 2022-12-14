import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetail } from '../../../utils'

export const questionKeys = ['arson'] as const

type QuestionKeys = typeof questionKeys[number]

@Page({ name: 'arson', bodyProperties: ['arson', 'arsonDetail'] })
export default class Arson implements TasklistPage {
  title = 'Arson'

  questionPredicates = {
    arson: 'a specialist arson room',
  }

  questions = {
    arson: `Does ${this.application.person.name} need ${this.questionPredicates.arson}?`,
  }

  hints = {
    arson: {
      html: `
      <p class="govuk-body">Consider whether the person poses an ongoing risk of setting fires based on:</p>

      <ul class="govuk-list govuk-list--bullet">
        <li>their current and previous offences,</li>
        <li>factors outside of the offences they were charged for,</li>
        <li>their behaviour in custody,</li>
        <li>and your expectations for how they'll behave in an AP setting.</li>
      </ul>
    `,
    },
  }

  constructor(
    public body: Partial<YesOrNoWithDetail<'arson'>>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'catering'
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.questions.arson]: yesOrNoResponseWithDetail<QuestionKeys>('arson', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arson) {
      errors.arson = `You must specify if ${this.application.person.name} needs ${this.questionPredicates.arson}`
    }

    if (this.body.arson === 'yes' && !this.body.arsonDetail) {
      errors.arsonDetail = `You must specify details about if ${this.application.person.name} needs ${this.questionPredicates.arson}`
    }

    return errors
  }
}
