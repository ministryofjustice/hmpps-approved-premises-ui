import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { TaskListErrors } from '@approved-premises/ui'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'

export const shortNoticeReasons = {
  riskEscalated: 'The risk level has recently escalated',
  planBrokenDown: 'The release plan or risk management plan has broken down',
  furtherOffence: 'The individual has committed a further offence',
  alternativeToRecall: 'AP placement is an alternative to recall',
  paroleBoardOrPPCS: 'AP placement is a parole board or PPCS decision',
  shortSentence: 'The sentence is shorter than 12 months',
  onBail: 'The individual will be on bail',
  other: 'Other, please specify',
}

export type ShortNoticeReasons = keyof typeof shortNoticeReasons
type ReasonForShortNoticeBody = { reason: ShortNoticeReasons; other: string }

@Page({ name: 'reason-for-short-notice', bodyProperties: ['reason', 'other'] })
export default class ReasonForShortNotice implements TasklistPage {
  name = 'reason-for-short-notice'

  title: string

  question: string

  constructor(
    public readonly body: Partial<ReasonForShortNoticeBody>,
    readonly application: Application,
  ) {
    if (noticeTypeFromApplication(application) === 'emergency') {
      this.title = 'Emergency application'
      this.question = 'What was the reason for submitting this application 7 days or less before the AP is needed?'
    } else {
      this.title = 'Short notice application'
      this.question = 'Why is this application being submitted outside of National Standards timescales?'
    }
  }

  next() {
    return 'placement-purpose'
  }

  previous() {
    return 'placement-date'
  }

  response() {
    return {
      [this.question]: this.body.reason === 'other' ? this.body.other : shortNoticeReasons[this.body.reason],
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reason) {
      errors.reason = 'You must specify a reason'
    }

    if (this.body.reason === 'other' && !this.body.other) {
      errors.other = 'You must specify what the other reason is'
    }

    return errors
  }

  items(conditionalHtml: string) {
    const items = convertKeyValuePairToRadioItems(shortNoticeReasons, this.body.reason)
    const other = items.pop()

    return [...items, { ...other, conditional: { html: conditionalHtml } }]
  }
}
