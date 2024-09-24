import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

@Page({ name: 'male-ap', bodyProperties: ['shouldPersonBePlacedInMaleAp'] })
export default class MaleAp implements TasklistPage {
  question = process.env.ENABLE_WE === 'true' ? 'What type of AP has the complex case board agreed to?' : 'Has the Complex Case Board determined that the person should be placed in a male AP?'

  title = this.question
  yesText = process.env.ENABLE_WE === 'true' ? 'Men\'s AP' : 'Yes'
  noText =  process.env.ENABLE_WE === 'true' ? 'Women\'s AP' : 'No'

  constructor(public body: { shouldPersonBePlacedInMaleAp: YesOrNo }) {}

  previous() {
    return 'board-taken-place'
  }

  next() {
    return this.body.shouldPersonBePlacedInMaleAp === 'yes' ? 'relevant-dates' : 'refer-to-delius'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.shouldPersonBePlacedInMaleAp),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.shouldPersonBePlacedInMaleAp) {
      errors.shouldPersonBePlacedInMaleAp =
        process.env.ENABLE_WE === 'true' ? 'You must specify what type of AP the complex case board has agreed to' : 'You must specify if the Complex Case Board determined that the person should be placed in a male AP'
    }

    return errors
  }
}
