import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { User } from '@approved-premises/api'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'
import { sentenceCase } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import SufficientInformation from './sufficientInformation'

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

  questions = {
    date: 'When did you receive this information?',
    details: 'Provide the additional information received from the probation practitioner',
  }

  user: User

  query: string

  constructor(
    private _body: Partial<InformationReceivedBody>,
    private readonly assessment: Assessment,
  ) {
    this.query = retrieveQuestionResponseFromFormArtifact(assessment, SufficientInformation, 'query')
  }

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
    const response = {
      [`${this.title}`]: sentenceCase(this.body.informationReceived),
    }

    if (this.body.informationReceived === 'yes') {
      response[this.questions.date] = DateFormats.isoDateToUIDate(this.body.responseReceivedOn)
      response[this.questions.details] = this.body.response
    }

    return response
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
