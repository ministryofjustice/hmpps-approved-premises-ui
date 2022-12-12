import type { TaskListErrors } from '@approved-premises/ui'
import { Application } from '../../../../@types/shared'
import { convertKeyValuePairToCheckBoxItems } from '../../../../utils/formUtils'

import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

export const offences = {
  arson: 'Arson offences',
  sexualOffence: 'Sexual offences',
  hateCrimes: 'Hate crimes',
  childNonSexualOffence: 'Non-sexual offences against children',
} as const

type Offences = Array<keyof typeof offences>
type RawOffences = Array<keyof typeof offences> | keyof typeof offences

type TypeOfConvictedOffenceBody = { offenceConvictions: Offences }
type RawTypeOfConvictedOffenceBody = { offenceConvictions?: RawOffences }

@Page({ name: 'type-of-convicted-offence', bodyProperties: ['offenceConvictions'] })
export default class TypeOfConvictedOffence implements TasklistPage {
  title = `What type of offending has ${this.application.person.name} been convicted of?`

  constructor(private _body: RawTypeOfConvictedOffenceBody, private readonly application: Application) {}

  public get body(): TypeOfConvictedOffenceBody {
    return this._body as TypeOfConvictedOffenceBody
  }

  public set body(value: RawTypeOfConvictedOffenceBody) {
    const offenceConvictions: Offences = value.offenceConvictions ? [value.offenceConvictions].flat() : []

    this._body = { offenceConvictions }
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

    if (!this.body.offenceConvictions.length) {
      errors.offenceConvictions = `You must specify at least one type of offence`
    }

    return errors
  }

  items() {
    return convertKeyValuePairToCheckBoxItems(offences, this.body.offenceConvictions)
  }
}
