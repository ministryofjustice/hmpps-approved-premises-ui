import type { TaskListErrors } from '@approved-premises/ui'

import { Page } from '../../../../utils/decorators'
import TasklistPage from '../../../../tasklistPage'
import { datePickerDateIsValid } from '../../../../../utils/dateUtils'

@Page({ name: 'pre-arrival-contact', bodyProperties: ['contactDate', 'contactMethod', 'reasonForNoContact'] })
export default class PreArrivalContact implements TasklistPage {
  name = 'pre-arrival-contact'

  title = 'Pre-arrival contact'

  questions: Record<keyof typeof this.body, { question: string; hint?: string }> = {
    contactDate: { question: 'Contact date', hint: 'For example, 17/5/2024' },
    contactMethod: { question: 'How did you contact the person?' },
    reasonForNoContact: { question: 'Reason for no contact', hint: 'Give brief details' },
  }

  constructor(public body: { contactDate?: string; contactMethod?: string; reasonForNoContact?: string }) {}

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return Object.entries(this.questions).reduce(
      (out, [k, v]) => {
        out[v.question] = this.body[k as keyof typeof this.body] || ''
        return out
      },
      {} as Record<string, string>,
    )
  }

  errors() {
    const noContact = this.body.contactMethod === 'noContact'
    this.body.reasonForNoContact = noContact ? this.body.reasonForNoContact : ''

    const errors: TaskListErrors<this> = {}
    if (!this.body.contactDate) errors.contactDate = 'You must enter a contact date'
    else if (!datePickerDateIsValid(this.body.contactDate)) errors.contactDate = 'The contact date is invalid'

    if (!this.body.contactMethod) errors.contactMethod = 'You must enter a contact method'
    if (noContact && !this.body.reasonForNoContact)
      errors.reasonForNoContact = 'You must enter a reason for not making contact'

    return errors
  }
}
