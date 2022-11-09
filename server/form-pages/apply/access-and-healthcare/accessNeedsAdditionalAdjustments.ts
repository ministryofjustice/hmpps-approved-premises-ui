import type { TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'
import { Application } from '../../../@types/shared'
import { SessionDataError } from '../../../utils/errors'
import { lowerCase } from '../../../utils/utils'

import TasklistPage from '../../tasklistPage'
import { applyYesOrNo, yesOrNoResponseWithDetail } from '../../utils'

export default class AccessNeedsAdditionalAdjustments implements TasklistPage {
  name = 'access-needs-additional-adjustments'

  title = 'Access needs'

  questions = { adjustments: `Does the placement require adjustments for the ${this.getNeeds()} needs you selected?` }

  body: YesOrNoWithDetail<'adjustments'>

  constructor(
    body: Record<string, unknown>,
    private readonly application: Application,
    private readonly previousPage: string,
  ) {
    this.body = {
      ...applyYesOrNo('adjustments', body),
    }
  }

  previous() {
    return this.previousPage
  }

  next() {
    return 'covid'
  }

  response() {
    return { [this.questions.adjustments]: yesOrNoResponseWithDetail<'adjustments'>('adjustments', this.body) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.adjustments) {
      errors.adjustments = 'You must specify whether the placement requires additional adjustments'
    }

    return errors
  }

  private getNeeds() {
    try {
      const additionalNeeds = this.application.data['access-and-healthcare']['access-needs'].additionalNeeds as string[]

      if (!additionalNeeds.length) throw new SessionDataError('No additional needs')

      const lowerCasedNeeds = additionalNeeds.map(need => lowerCase(need))

      if (additionalNeeds.length === 1) return lowerCasedNeeds[0]
      return `${lowerCasedNeeds.slice(0, -1).join(', ')} and ${lowerCasedNeeds.slice(-1)}`
    } catch (e) {
      throw new SessionDataError(`Access needs additional adjustments error: ${e}`)
    }
  }
}
