import type { TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '../../../@types/shared'
import { validPostcodeArea } from '../../../utils/formUtils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'relocation-region', bodyProperties: ['postcodeArea'] })
export default class RelocationRegion implements TasklistPage {
  name = 'relocation-region'

  title = 'Placement duration and move on'

  question = `Where is ${this.application.person.name} most likely to live when they move on from the AP?`

  hint = 'Postcode area'

  constructor(
    public body: {
      postcodeArea?: string
    },
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'placement-duration'
  }

  next() {
    return 'plans-in-place'
  }

  response() {
    return {
      [this.question]: this.body.postcodeArea,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.postcodeArea) {
      errors.postcodeArea = 'You must enter a postcode region'
    } else if (!validPostcodeArea(this.body.postcodeArea)) {
      errors.postcodeArea = 'You must enter a valid postcode region'
    }

    return errors
  }
}
