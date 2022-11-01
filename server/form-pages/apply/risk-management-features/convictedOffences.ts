import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { convertKeyValuePairToRadioItems } from '../../../utils/formUtils'

import TasklistPage from '../../tasklistPage'

export const responses = {
  yes: 'Yes',
  no: 'No',
}

export default class ConvictedOffences implements TasklistPage {
  name = 'convicted-offences'

  title = `Has ${this.application.person.name} ever been convicted of the following offences?`

  body: { response: YesOrNo }

  furtherDetails = `This includes any spent or unspent convictions over their lifetime.`

  offences = ['Arson offences', 'Sexual offences', 'Hate crimes', 'Non-sexual offences against children']

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      response: body.response as YesOrNo,
    }
  }

  previous() {
    return 'risk-management-features'
  }

  next() {
    return 'date-of-offence'
  }

  response() {
    return {
      [this.title]: { furtherDetails: this.furtherDetails, offences: this.offences.join(', ') },
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.response) {
      errors.response = `You must specify if ${this.application.person.name} has been convicted of any of the listed offences`
    }

    return errors
  }

  items() {
    convertKeyValuePairToRadioItems(responses, this.body.response)
  }
}
