import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import {
  ApprovedPremisesAssessment as Assessment,
  Cas1ApplicationUserDetails as UserDetails,
} from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ConfirmYourDetails from '../../../apply/reasons-for-placement/basic-information/confirmYourDetails'
import {
  userDetailsFromCaseManagerPage,
  userDetailsFromConfirmYourDetailsPage,
} from '../../../../utils/applications/userDetailsFromApplication'

const caseManagerKeys: Array<keyof UserDetails> = ['name', 'email', 'telephoneNumber']

@Page({
  name: 'sufficient-information-sent',
  bodyProperties: [],
})
export default class SufficientInformationSent implements TasklistPage {
  name = 'sufficient-information-sent'

  title = 'How to get further information'

  caseManager: UserDetails = {
    name: '',
    email: '',
    telephoneNumber: '',
  }

  constructor(
    public readonly body: Record<string, unknown>,
    assessment: Assessment,
  ) {
    caseManagerKeys.forEach(fieldName => {
      this.caseManager[fieldName] =
        this.caseManagerDetailsFromApplication(assessment)?.[fieldName] ||
        this.caseManagerDetailsFromFormData(assessment)?.[fieldName] ||
        `No ${fieldName} for case manager supplied`
    })
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

  private caseManagerDetailsFromApplication(assessment: Assessment) {
    return assessment.application?.caseManagerIsNotApplicant
      ? assessment.application?.caseManagerUserDetails
      : assessment.application?.applicantUserDetails
  }

  private caseManagerDetailsFromFormData(assessment: Assessment) {
    const caseManagerIsNotApplicant = Boolean(
      retrieveOptionalQuestionResponseFromFormArtifact(
        assessment.application,
        ConfirmYourDetails,
        'caseManagementResponsibility',
      ) === 'no',
    )

    return caseManagerIsNotApplicant
      ? userDetailsFromCaseManagerPage(assessment.application)
      : userDetailsFromConfirmYourDetailsPage(assessment.application)
  }
}
