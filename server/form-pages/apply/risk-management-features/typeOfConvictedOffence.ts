import type { TaskListErrors } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

import TasklistPage from '../../tasklistPage'

export const offences = {
  arson: 'Arson offences',
  sexualOffence: 'Sexual offences',
  hateCrimes: 'Hate crimes',
  childNonSexualOffence: 'Non-sexual offences against children',
} as const

type Offences = Array<keyof typeof offences>

export default class TypeOfConvictedOffence implements TasklistPage {
  name = 'type-of-convicted-offence'

  title = `What type of offending has ${this.application.person.name} been convicted of?`

  body: { offenceConvictions: Offences }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      offenceConvictions: body.offenceConvictions as Offences,
    }
  }

  previous() {
    return 'convicted-offences'
  }

  next() {
    return 'date-of-offence'
  }

  response() {
    return {
      [`${this.title}`]: Array.isArray(this.body.offenceConvictions)
        ? this.body.offenceConvictions.map(offence => offences[offence]).join(', ')
        : offences[this.body.offenceConvictions],
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.offenceConvictions) {
      errors.offenceConvictions = `You must specify at least one type of offence`
    }

    return errors
  }

  items() {
    return convertKeyValuePairToCheckBoxItems(offences, this.body.offenceConvictions)
  }
}
