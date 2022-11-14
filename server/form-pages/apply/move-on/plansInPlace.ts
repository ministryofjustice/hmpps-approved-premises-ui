import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'

export default class PlansInPlace implements TasklistPage {
  name = 'plans-in-place'

  title = 'Placement duration and move on'

  question = 'Are move on arrangements already in place for when the person leaves the AP?'

  body: { arePlansInPlace: YesOrNo }

  constructor(body: Record<string, unknown>) {
    this.body = {
      arePlansInPlace: body.arePlansInPlace as YesOrNo,
    }
  }

  previous() {
    return 'pdu-region'
  }

  next() {
    return ''
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
