import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ConfirmYourDetails, { Body } from '../../../apply/reasons-for-placement/basic-information/confirmYourDetails'

@Page({
  name: 'sufficient-information-sent',
  bodyProperties: [],
})
export default class SufficientInformationSent implements TasklistPage {
  name = 'sufficient-information-sent'

  title = 'How to get further information'

  userName: Body['name']

  emailAddress: Body['emailAddress']

  phoneNumber: Body['phoneNumber']

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    public readonly body: Record<string, unknown>,
    assessment: Assessment,
  ) {
    this.userName =
      retrieveOptionalQuestionResponseFromFormArtifact(assessment.application, ConfirmYourDetails, 'name') || ''
    this.emailAddress =
      retrieveOptionalQuestionResponseFromFormArtifact(assessment.application, ConfirmYourDetails, 'emailAddress') || ''
    this.phoneNumber =
      retrieveOptionalQuestionResponseFromFormArtifact(assessment.application, ConfirmYourDetails, 'phoneNumber') || ''
  }

  previous() {
    return ''
  }

  next() {
    return 'information-received'
  }

  response() {
    return {}
  }

  errors() {
    return {}
  }
}
