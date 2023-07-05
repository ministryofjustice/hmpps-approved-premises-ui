import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { User } from '@approved-premises/api'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

type InformationReceivedBody = ObjectWithDateParts<'responseReceivedOn'> & {
  informationReceived?: YesOrNo
  response?: string
}

@Page({
  name: 'information-received',
  bodyProperties: ['informationReceived', 'response', ...dateBodyProperties('responseReceivedOn')],
  controllerActions: { update: 'updateInformationRecieved' },
})
export default class InformationReceived implements TasklistPage {
  name = 'information-received'

  title = 'Have you received additional information from the probation practitioner?'

  user: User

  constructor(private _body: Partial<InformationReceivedBody>) {}

  public set body(value: Partial<InformationReceivedBody>) {
    this._body = {
      informationReceived: value.informationReceived as YesOrNo,
    }
    this._body = {
      informationReceived: value.informationReceived as YesOrNo,
      response: value.response,
      'responseReceivedOn-year': value['responseReceivedOn-year'] as string,
      'responseReceivedOn-month': value['responseReceivedOn-month'] as string,
      'responseReceivedOn-day': value['responseReceivedOn-day'] as string,
      responseReceivedOn: DateFormats.dateAndTimeInputsToIsoString(
        value as ObjectWithDateParts<'responseReceivedOn'>,
        'responseReceivedOn',
      ).responseReceivedOn,
    }
  }

  public get body(): InformationReceivedBody {
    return this._body as InformationReceivedBody
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return {
      [`${this.title}`]: sentenceCase(this.body.informationReceived),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.informationReceived)
      errors.informationReceived =
        'You must confirm if you have received additional information from the probation practitioner'

    if (this.body.informationReceived === 'yes' && !this.body.response) {
      errors.response = 'You must specify the information you have received'
    }

    if (this.body.informationReceived === 'yes') {
      if (dateIsBlank(this.body, 'responseReceivedOn')) {
        errors.responseReceivedOn = 'You must specify when you received the information'
      } else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'responseReceivedOn'>, 'responseReceivedOn')
      ) {
        errors.responseReceivedOn = 'The date is invalid'
      }
    }

    return errors
  }
}
