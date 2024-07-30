import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

export type Body = { sufficientInformation?: YesOrNo; query?: string }

@Page({
  name: 'sufficient-information',
  bodyProperties: ['sufficientInformation', 'query'],
})
export default class SufficientInformation implements TasklistPage {
  name = 'sufficient-information'

  title = 'Is there enough information in the application for you to make a decision?'

  furtherInformationQuestion = 'What additional information is needed?'

  constructor(
    public body: Body,
    private readonly assessment: Assessment,
  ) {}

  static async initialize(body: Body, assessment: Assessment): Promise<SufficientInformation> {
    return new SufficientInformation(body, assessment)
  }

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.previouslyRequested()) {
      return 'information-received'
    }

    if (this.body.sufficientInformation === 'no') {
      return 'sufficient-information-confirm'
    }
    return ''
  }

  response() {
    return {
      [`${this.title}`]: sentenceCase(this.body.sufficientInformation),
      [`${this.furtherInformationQuestion}`]: this.body?.query ?? '',
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sufficientInformation)
      errors.sufficientInformation =
        'You must confirm if there is enough information in the application to make a decision'

    if (this.body.sufficientInformation === 'no' && !this.body.query) {
      errors.query = 'You must specify what additional information is needed'
    }

    return errors
  }

  previouslyRequested() {
    return (
      this.body.sufficientInformation === 'no' &&
      retrieveOptionalQuestionResponseFromFormArtifact(
        this.assessment,
        SufficientInformation,
        'sufficientInformation',
      ) === 'no'
    )
  }
}
