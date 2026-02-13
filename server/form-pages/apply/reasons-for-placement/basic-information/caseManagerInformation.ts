import type { TaskListErrors } from '@approved-premises/ui'

import { lowerCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import { UserDetails, userDetailsKeys } from './confirmYourDetails'
import { isValidEmail } from '../../../../utils/formUtils'

export type CaseManagerDetails = Omit<UserDetails, 'area'>

export const caseManagerKeys = userDetailsKeys.filter(key => key !== 'area')

@Page({ name: 'case-manager-information', bodyProperties: caseManagerKeys })
export default class CaseManagerInformation implements TasklistPage {
  title = 'Add case manager information'

  caseManager: CaseManagerDetails

  inputLabels: CaseManagerDetails = {
    name: 'Case manager name',
    emailAddress: 'Case manager email',
    phoneNumber: 'Case manager phone number',
  }

  constructor(public body: Partial<CaseManagerDetails>) {}

  previous() {
    return 'confirm-your-details'
  }

  next() {
    return 'transgender'
  }

  response() {
    return {
      'Case manager name': this.body.name,
      'Case manager email': this.body.emailAddress,
      'Case manager phone number': this.body.phoneNumber,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    caseManagerKeys.forEach(field => {
      if (!this.body[field]) {
        errors[field] = `You must enter the case manager's ${lowerCase(field)}`
      } else if (field === 'emailAddress' && !isValidEmail(this.body.emailAddress || '')) {
        errors.emailAddress = 'Enter an email address ending .gov.uk'
      }
    })

    return errors
  }
}
