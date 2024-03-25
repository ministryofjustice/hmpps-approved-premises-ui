import type { TaskListErrors } from '@approved-premises/ui'
import { validPostcodeArea } from '../../../utils/formUtils'
import { Page } from '../../utils/decorators'

import TasklistPage from '../../tasklistPage'

@Page({ name: 'relocation-region', bodyProperties: ['postcodeArea'] })
export default class RelocationRegion implements TasklistPage {
  name = 'relocation-region'

  title = 'Placement duration and move on'

  question = `Where is the person most likely to live when they move on from the AP?`

  hint =
    'Please provide the postcode area only. To get the postcode from the full postcode remove the last 3 characters. For example, the postcode area for SW11 4NJ is SW11.'

  constructor(
    public body: {
      postcodeArea?: string
    },
  ) {
    this.body.postcodeArea = body?.postcodeArea?.toUpperCase().trim()
  }

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
      errors.postcodeArea = 'You must enter a postcode area'
    } else if (!validPostcodeArea(this.body.postcodeArea)) {
      errors.postcodeArea = 'You must enter a valid postcode area'
    }

    return errors
  }
}
