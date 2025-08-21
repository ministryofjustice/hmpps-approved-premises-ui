import type { TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication as Application, SentenceTypeOption } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import {
  adjacentPageFromSentenceType,
  sentenceTypes,
} from '../../../../utils/applications/adjacentPageFromSentenceType'

@Page({ name: 'sentence-type', bodyProperties: ['sentenceType'] })
export default class SentenceType implements TasklistPage {
  title = 'Which sentence type does the person have?'

  constructor(
    readonly body: { sentenceType?: SentenceTypeOption },
    readonly application: Application,
  ) {}

  response() {
    return { [this.title]: sentenceTypes[this.body.sentenceType] }
  }

  previous() {
    return 'relevant-dates'
  }

  next() {
    return adjacentPageFromSentenceType(this.body.sentenceType)
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sentenceType) {
      errors.sentenceType = 'You must choose a sentence type'
    }

    return errors
  }

  items(conditionalHtml: string) {
    return Object.entries(sentenceTypes).map(([value, text]) => ({
      value,
      text,
      checked: this.body.sentenceType === value,
      conditional: { html: value === 'nonStatutory' ? conditionalHtml : '' },
    }))
  }
}
