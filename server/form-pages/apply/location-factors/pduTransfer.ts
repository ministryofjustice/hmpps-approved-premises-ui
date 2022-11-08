import type { TaskListErrors } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'

import TasklistPage from '../../tasklistPage'

const questions = {
  yes: 'Yes',
  noNeedToMakeArrangements: 'No, I still need to make arrangements',
  noProbationPractitioner: 'No, management and supervision will be maintained by the existing probation practitioner',
}

type Response = keyof typeof questions

export default class PduTransfer implements TasklistPage {
  name = 'pdu-transfer'

  title = `Have you agreed ${this.application.person.name}'s transfer/supervision with the receiving PDU?`

  body: { transferStatus: Response; probationPractitioner?: string }

  questions = questions

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = { transferStatus: body.transferStatus as Response }
    if (this.body.transferStatus === 'yes') {
      this.body.probationPractitioner = body.probationPractitioner as string
    }
  }

  previous() {
    return 'describe-location-factors'
  }

  next() {
    return ''
  }

  response() {
    if (!this.body.probationPractitioner) return { [this.title]: questions[this.body.transferStatus] }
    return {
      [this.title]: questions[this.body.transferStatus],
      'Probation practitioner': this.body.probationPractitioner,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}
    if (!this.body.transferStatus) {
      errors.transferStatus = 'You must choose an answer'
    }
    if (this.body.transferStatus === 'yes' && !this.body.probationPractitioner) {
      errors.probationPractitioner = "You must give the probation practitioner's name"
    }
    return errors
  }
}
