import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import {
  ApprovedPremisesAssessment as Assessment,
  Cas1ApplicationUserDetails as UserDetails,
} from '../../../../@types/shared'
import { lowerCase } from '../../../../utils/utils'

const userDetailsKeys: Array<keyof UserDetails> = ['name', 'email', 'telephoneNumber']

@Page({
  name: 'sufficient-information-sent',
  bodyProperties: [],
})
export default class SufficientInformationSent implements TasklistPage {
  name = 'sufficient-information-sent'

  title = 'How to get further information'

  caseManagerIsNotApplicant: boolean

  caseManager: UserDetails = {
    name: '',
    email: '',
    telephoneNumber: '',
  }

  applicant: UserDetails = { name: '', email: '', telephoneNumber: '' }

  constructor(
    public readonly body: Record<string, unknown>,
    assessment: Assessment,
  ) {
    this.caseManagerIsNotApplicant = assessment.application?.caseManagerIsNotApplicant

    userDetailsKeys.forEach(fieldName => {
      this.caseManager[fieldName] =
        assessment.application?.caseManagerUserDetails?.[fieldName] || this.fieldNotSupplied(fieldName)
    })

    userDetailsKeys.forEach(fieldName => {
      this.applicant[fieldName] =
        assessment.application?.applicantUserDetails?.[fieldName] || this.fieldNotSupplied(fieldName)
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

  private fieldNotSupplied(fieldName: string) {
    return `No ${lowerCase(fieldName)} supplied`
  }
}
