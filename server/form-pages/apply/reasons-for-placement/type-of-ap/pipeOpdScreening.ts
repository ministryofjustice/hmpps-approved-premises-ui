import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

@Page({ name: 'pipe-opd-screening', bodyProperties: ['pipeReferral', 'pipeReferralMoreDetail'] })
export default class PipeOpdReferral implements TasklistPage {
  title = 'Has an application for PIPE placement been recommended in the OPD pathway plan?'

  questions = {
    pipeReferral: this.title,
    pipeReferralMoreDetail: `Provide any additional detail about why ${nameOrPlaceholderCopy(
      this.application.person,
    )} needs a PIPE placement.`,
  }

  constructor(
    public body: Partial<{ pipeReferral: YesOrNo; pipeReferralMoreDetail: string }>,
    private readonly application: ApprovedPremisesApplication,
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
        'You must specify if an application for PIPE placement has been recommended in the OPD pathway plan'
    }

    return errors
  }
}
