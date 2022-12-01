import type { YesOrNo, TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'

@Page({ name: 'pipe-opd-screening', bodyProperties: ['pipeReferral', 'pipeReferralMoreDetail'] })
export default class PipeOpdReferral implements TasklistPage {
  title = 'Has a referral for PIPE placement been recommended in the OPD pathway plan?'

  questions = {
    pipeReferral: this.title,
    pipeReferralMoreDetail: `Additional detail about why ${this.application.person.name} needs a PIPE placement.`,
  }

  constructor(
    public body: Partial<{ pipeReferral: YesOrNo; pipeReferralMoreDetail: string }>,
    private readonly application: Application,
  ) {}

  next() {
    return ''
  }

  previous() {
    return 'pipe-referral'
  }

  response() {
    const response = {
      [this.questions.pipeReferral]: convertToTitleCase(this.body.pipeReferral),
    } as Record<string, string>

    if (this.body.pipeReferral === 'yes') {
      response[this.questions.pipeReferralMoreDetail] = this.body.pipeReferralMoreDetail
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.pipeReferral) {
      errors.pipeReferral =
        'You must specify if  a referral for PIPE placement has been recommended in the OPD pathway plan'
    }

    return errors
  }
}
