import { findKey } from 'underscore'
import type { TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({
  name: 'make-a-decision',
  bodyProperties: ['decision', 'decisionRationale'],
})
export default class MakeADecision implements TasklistPage {
  name = 'make-a-decision'

  title = 'Make a decision'

  responses: Record<string, Record<string, string>> = {
    'Accept as suitable for an AP': {
      accept: 'Accept',
    },
    'Reject, not suitable for an AP': {
      accommodationNeedOnly: 'Accommodation need only',
      needsCannotBeMet: 'Health / social care / disability needs cannot be met',
      supervisionPeriodTooShort: 'Remaining supervision period too short',
      riskTooLow: 'Risk too low',
      otherReasons: 'Not suitable for other reasons',
    },
    'Reject, insufficient information': {
      insufficientMoveOnPlan: 'Insufficient move on plan',
      insufficientContingencyPlan: 'Insufficient contingency plan',
      informationNotProvided: 'Requested information not provided by probation practitioner',
    },
    'Reject, risk too high (must be approved by an AP Area Manager (APAM)': {
      riskToCommunity: 'Risk to community',
      riskToOthersInAP: 'Risk to other people in AP',
      riskToStaff: 'Risk to staff',
    },
    'Application withdrawn': {
      withdrawnByPp: 'Application withdrawn by the probation practitioner',
    },
  }

  constructor(
    public body: {
      decision: string
      decisionRationale?: string
    },
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    const { decision } = this.body
    const topLevelDescription = findKey(this.responses, reason => Boolean(reason[decision]))

    return {
      Decision: `${topLevelDescription}: ${this.responses[topLevelDescription][decision]}`,
      'Decision rationale': this.body?.decisionRationale?.trim() || 'No rationale provided',
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.decision) errors.decision = 'You must select one option'
    if (this.body.decision && !['accept', 'withdrawnByPp'].includes(this.body.decision) && !this.body.decisionRationale)
      errors.decisionRationale = 'You must provide the rationale for your decision'

    return errors
  }
}
