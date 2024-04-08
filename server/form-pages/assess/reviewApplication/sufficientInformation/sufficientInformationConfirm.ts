import type { DataServices, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
// eslint-disable-next-line import/no-cycle
import SufficientInformation from './sufficientInformation'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

@Page({
  name: 'sufficient-information-confirm',
  bodyProperties: ['confirm'],
})
export default class SufficientInformationConfirm implements TasklistPage {
  name = 'sufficient-information-confirm'

  title = 'Are you sure that you want to request more information about this application?'

  constructor(
    public body: { confirm?: YesOrNo },
    public assessment: Assessment,
  ) {}

  static async initialize(
    body: Record<string, unknown>,
    assessment: Assessment,
    token: string,
    dataServices: DataServices,
  ) {
    const page = new SufficientInformationConfirm(body, assessment)

    if (page.body.confirm === 'yes' && !page.alreadyConfirmed()) {
      const query = retrieveQuestionResponseFromFormArtifact(assessment, SufficientInformation, 'query')
      await dataServices.assessmentService.createClarificationNote(token, assessment.id, { query })
    }

    return page
  }

  previous() {
    return 'sufficient-information'
  }

  next() {
    if (this.alreadyConfirmed()) {
      return 'information-received'
    }

    if (this.body.confirm === 'yes') return 'sufficient-information-sent'

    if (this.assessment.clarificationNotes.length) {
      return ''
    }

    return 'sufficient-information'
  }

  response() {
    return {}
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.confirm)
      errors.confirm =
        'You must confirm that you are sure that you want to request more information about this application'

    return errors
  }

  alreadyConfirmed() {
    return (
      this.body.confirm === 'yes' &&
      retrieveOptionalQuestionResponseFromFormArtifact(this.assessment, SufficientInformationConfirm, 'confirm') ===
        'yes'
    )
  }
}
