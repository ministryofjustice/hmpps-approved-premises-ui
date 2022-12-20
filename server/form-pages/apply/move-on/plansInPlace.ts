import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'plans-in-place', bodyProperties: ['arePlansInPlace'] })
export default class PlansInPlace implements TasklistPage {
  name = 'plans-in-place'

  title = 'Placement duration and move on'

  question = 'Are move on arrangements already in place for when the person leaves the AP?'

  constructor(public body: { arePlansInPlace?: YesOrNo }) {}

  previous() {
    return 'relocation-region'
  }

  next() {
    return 'type-of-accommodation'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.arePlansInPlace),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.arePlansInPlace) {
      errors.arePlansInPlace =
        'You must answer whether move on arrangements are already in place for when the person leaves the AP'
    }

    return errors
  }
}
