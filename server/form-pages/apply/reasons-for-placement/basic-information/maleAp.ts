import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import config from '../../../../config'

@Page({ name: 'male-ap', bodyProperties: ['shouldPersonBePlacedInMaleAp'] })
export default class MaleAp implements TasklistPage {
  question = config.flags.weEnabled
    ? 'What type of AP has the complex case board agreed to?'
    : 'Has the Complex Case Board determined that the person should be placed in a male AP?'

  title = this.question

  yesText = config.flags.weEnabled ? "Men's AP" : 'Yes'

  noText = config.flags.weEnabled ? "Women's AP" : 'No'

  constructor(public body: { shouldPersonBePlacedInMaleAp: YesOrNo }) {}

  previous() {
    return 'board-taken-place'
  }

  next() {
    return this.body.shouldPersonBePlacedInMaleAp === 'yes' ? 'relevant-dates' : 'refer-to-delius'
  }

  response() {
    return {
      [this.question]: this.body.shouldPersonBePlacedInMaleAp === 'yes' ? this.yesText : this.noText,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.shouldPersonBePlacedInMaleAp) {
      errors.shouldPersonBePlacedInMaleAp = config.flags.weEnabled
        ? 'You must specify what type of AP the complex case board has agreed to'
        : 'You must specify if the Complex Case Board determined that the person should be placed in a male AP'
    }

    return errors
  }
}
