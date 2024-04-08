import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
// eslint-disable-next-line import/no-cycle
import SufficientInformationConfirm from './sufficientInformationConfirm'

@Page({
  name: 'sufficient-information',
  bodyProperties: ['sufficientInformation', 'query'],
})
export default class SufficientInformation implements TasklistPage {
  name = 'sufficient-information'

  title = 'Is there enough information in the application for you to make a decision?'

  furtherInformationQuestion = 'What additional information is needed?'

  constructor(
    public body: { sufficientInformation?: YesOrNo; query?: string },
    private assessment: Assessment,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    // In order to prevent an infinite loop when the user selects 'no' and then 'no' on 'sufficient-information-confirm'
    if (
      this.body.sufficientInformation === 'no' &&
      retrieveOptionalQuestionResponseFromFormArtifact(this.assessment, SufficientInformationConfirm, 'confirm') ===
        'no' &&
      this.assessment?.clarificationNotes.length
    ) {
      delete this.assessment.data['sufficient-information']['sufficient-information-confirm']
    }
    return this.body.sufficientInformation === 'no' ? 'sufficient-information-confirm' : ''
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
}
