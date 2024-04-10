import type { TaskListErrors } from '@approved-premises/ui'
import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { FeatureFlags } from '../../../../services/featureFlagService'

@Page({ name: 'check-your-answers', bodyProperties: ['reviewed'] })
export default class Review implements TasklistPage {
  name = 'check-your-answers'

  title = 'Check your answers'

  constructor(
    public body: { reviewed?: string },
    readonly assessment: Assessment,
    readonly featureFlags: FeatureFlags,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
