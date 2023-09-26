import type { TaskListErrors } from '@approved-premises/ui'

import { lowerCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

export type CaseManagerDetails = {
  name: string
  emailAddress: string
  phoneNumber: string
}

export const fields: ReadonlyArray<keyof CaseManagerDetails> = ['name', 'emailAddress', 'phoneNumber']

@Page({ name: 'case-manager-information', bodyProperties: ['name', 'emailAddress', 'phoneNumber'] })
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

    fields.forEach(field => {
      if (!this.body[field]) {
        errors[field] = `You must enter the case manager's ${lowerCase(field)}`
      }
    })

    return errors
  }
}
