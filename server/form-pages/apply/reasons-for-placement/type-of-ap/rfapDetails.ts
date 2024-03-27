import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { yesOrNoResponseWithDetailForYes } from '../../../utils'

export type RfapDetailsBody = {
  motivation: string
  continuedRecovery: string
} & YesOrNoWithDetail<'receivingTreatment'>

@Page({
  name: 'rfap-details',
  bodyProperties: ['motivation', 'receivingTreatment', 'receivingTreatmentDetail', 'continuedRecovery'],
})
export default class RfapDetails implements TasklistPage {
  name = 'rfap'

  title = 'Recovery Focused Approved Premises (RFAP)'

  questions = {
    motivation: {
      copy: 'How has the person demonstrated their motivation to address their substance misuse?',
      hint: `
        <p class="govuk-body">This could include if the person has been, or is:
        <ul class="govuk-list govuk-list--bullet">
          <li>living on an incentivised substance free living (ISFL) unit in custody</li>
          <li>on an abstinence or drug recovery wing</li>
          <li>engaged with the drugs and alcohol rehabilitation treatment (DART) team in custody</li>
          <li>engaged with support services (for example the prison chaplaincy)</li>
        </ul>
`,
    },
    receivingTreatment: {
      copy: 'Is this person receiving clinical, medical and/or psychosocial treatment for their substance misuse?',
      hint: 'Such as a clinical treatment pathway. Or an intervention (for example, an accredited programme)',
    },
    continuedRecovery: {
      copy: 'How is the person planning to continue their recovery work whilst in the AP?',
      hint: 'This could include working with a sober coach, continuing with mutual aid groups (such as AA/NA/CA), or assessing treatment options.',
    },
  }

  constructor(public body: Partial<RfapDetailsBody>) {}

  previous() {
    return 'ap-type'
  }

  next() {
    return ''
  }

  response() {
    const response: Record<string, string> = {}
    response[this.questions.motivation.copy] = this.body.motivation
    response[this.questions.receivingTreatment.copy] = yesOrNoResponseWithDetailForYes('receivingTreatment', this.body)
    response[this.questions.continuedRecovery.copy] = this.body.continuedRecovery

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.motivation) {
      errors.motivation =
        'You must state how this person has demonstrated their motivation to address their substance misuse'
    }

    if (!this.body.receivingTreatment) {
      errors.receivingTreatment =
        'You must state if this person is receiving clinical, medical and/or psychosocial treatment for their substance misuse'
    }

    if (!this.body.continuedRecovery) {
      errors.continuedRecovery =
        'You must state how this person is planning to continue their recovery work whilst in the AP'
    }

    return errors
  }
}
