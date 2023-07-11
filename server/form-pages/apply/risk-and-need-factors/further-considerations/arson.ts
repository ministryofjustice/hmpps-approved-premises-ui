import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import type { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForYes } from '../../../utils'

export const questionKeys = ['arson'] as const

type QuestionKeys = (typeof questionKeys)[number]

@Page({ name: 'arson', bodyProperties: ['arson', 'arsonDetail'] })
export default class Arson implements TasklistPage {
  title = 'Arson'

  questionPredicates = {
    arson: 'pose an arson risk',
  }

  questions = {
    arson: `Does ${this.application.person.name} ${this.questionPredicates.arson}?`,
  }

  hints = {
    arson: {
      html: `
      <p class="govuk-body">Consider whether the person poses an ongoing risk of setting fires based on:</p>

      <ul class="govuk-list govuk-list--bullet">
        <li>their current and previous offences</li>
        <li>previous fire setting behaviour which has not resulted in a conviction</li>
        <li>their behaviour in custody</li>
        <li>whether any additional measures are required to manage the arson risk in an AP setting</li>
      </ul>
    `,
    },
  }

  constructor(
    public body: Partial<YesOrNoWithDetail<'arson'>>,
    private readonly application: Application,
  ) {}

  previous() {
    return 'catering'
  }

  next() {
    return 'additional-circumstances'
  }

  response() {
    return {
      [this.questions.arson]: yesOrNoResponseWithDetailForYes<QuestionKeys>('arson', this.body),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arson) {
      errors.arson = `You must specify if ${this.application.person.name} poses an arson risk`
    }

    if (this.body.arson === 'yes' && !this.body.arsonDetail) {
      errors.arsonDetail = `You must specify details if ${this.application.person.name} poses an arson risk`
    }

    return errors
  }
}
