import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'
import { lowerCase, sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'

export const responses = {
  yes: 'Yes',
  no: 'No',
}

@Page({ name: 'convicted-offences', bodyProperties: ['response'] })
export default class ConvictedOffences implements TasklistPage {
  title = `Has the person ever been convicted of the following offences?`

  furtherDetails = `This includes any spent or unspent convictions over their lifetime.`

  offences = ['Sexual offences', 'Hate crimes', 'Non-sexual offences against children']

  constructor(public body: { response?: YesOrNo }) {}

  previous() {
    return 'risk-management-features'
  }

  next() {
    return this.body.response === 'yes' ? 'date-of-offence' : 'rehabilitative-interventions'
  }

  response() {
    const offenceList = lowerCase(`${this.offences.slice(0, -1).join(', ')} or ${this.offences.slice(-1)}`)
    return {
      [`Has the person ever been convicted of any ${offenceList}?`]: sentenceCase(this.body.response),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.response) {
      errors.response = `You must specify if the person has been convicted of any of the listed offences`
    }

    return errors
  }

  items() {
    convertKeyValuePairToRadioItems(responses, this.body.response)
  }
}
