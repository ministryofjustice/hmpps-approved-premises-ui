import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Application } from '../../../../@types/shared'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type AccessNeedsMobilityBody = {
  needsWheelchair: YesOrNo
  mobilityNeeds: string
  visualImpairment: string
}

@Page({ name: 'access-needs-mobility', bodyProperties: ['needsWheelchair', 'mobilityNeeds', 'visualImpairment'] })
export default class AccessNeedsMobility implements TasklistPage {
  title = 'Access needs'

  questions = {
    wheelchair: `Does ${this.application.person.name} require a wheelchair accessible room?`,
    mobilityNeeds: 'Mobility needs',
    visualImpairment: 'Visual Impairment',
  }

  constructor(public body: Partial<AccessNeedsMobilityBody>, private readonly application: Application) {}

  previous() {
    return 'access-needs'
  }

  next() {
    return 'access-needs-additional-adjustments'
  }

  response() {
    const response = {
      [this.questions.wheelchair]: sentenceCase(this.body.needsWheelchair),
      [this.questions.mobilityNeeds]: this.body.mobilityNeeds,
      [this.questions.visualImpairment]: this.body.visualImpairment,
    }
    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.needsWheelchair) {
      errors.needsWheelchair = 'You must confirm the need for a wheelchair'
    }

    return errors
  }
}
