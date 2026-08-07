/* istanbul ignore file */
import { Cas1Application as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { displayName } from '../../../../utils/personUtils'
import { getApplicationTierValue } from '../../../../utils/applications/utils'

@Page({ name: 'not-eligible', bodyProperties: [] })
export default class NotEligible implements TasklistPage {
  title: string

  tier: string

  constructor(
    public readonly body: Record<string, unknown>,
    application: Application,
  ) {
    this.title = `${displayName(application.person)} is not eligible for an AP placement`
    this.tier = getApplicationTierValue(application)
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    return {}
  }
}
