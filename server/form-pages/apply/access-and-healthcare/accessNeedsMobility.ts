import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

export default class AccessNeedsMobility implements TasklistPage {
  name = 'access-needs-mobility'

  title = 'Access needs'

  questions = {
    wheelchair: `Does ${this.application.person.name} require use of a wheelchair?`,
    mobilityNeeds: 'Mobility needs',
    visualImpairment: 'Visual Impairment',
  }

  body: {
    needsWheelchair: YesOrNo
    mobilityNeeds: string
    visualImpairment: string
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      needsWheelchair: body.needsWheelchair as YesOrNo,
      mobilityNeeds: body.mobilityNeeds as string,
      visualImpairment: body.visualImpairment as string,
    }
  }

  previous() {
    return 'access-needs'
  }

  next() {
    return 'covid'
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
