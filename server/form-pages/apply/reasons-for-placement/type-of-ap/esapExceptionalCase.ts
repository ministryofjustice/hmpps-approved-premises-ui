import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'
import { DateFormats, dateAndTimeInputsAreValidDates } from '../../../../utils/dateUtils'

import TasklistPage from '../../../tasklistPage'
import { dateBodyInputProperties } from '../../../utils/dateBodyProperties'

export type EsapExceptionalCaseBody = ObjectWithDateParts<'agreementDate'> & {
  agreedCaseWithCommunityHopp: YesOrNo
  communityHoppName: string
  agreementSummary: string
}

@Page({
  name: 'esap-exceptional-case',
  bodyProperties: [
    'agreedCaseWithCommunityHopp',
    'communityHoppName',
    ...dateBodyInputProperties('agreementDate'),
    'agreementSummary',
  ],
  mergeBody: true,
})
export default class EsapExceptionalCase implements TasklistPage {
  title =
    'Has there been agreement with the Community Head of Public Protection that an application should be made as an exceptional case?'

  questions = {
    communityHoppName: 'Name of Community HOPP',
    agreementDate: 'Date of agreement',
    agreementSummary: 'Provide a summary of the reasons why this is an exempt application',
  }

  body: EsapExceptionalCaseBody

  constructor(_body: Partial<EsapExceptionalCaseBody>) {
    this.body = {
      agreedCaseWithCommunityHopp: _body.agreedCaseWithCommunityHopp,
      communityHoppName: _body.communityHoppName,
      'agreementDate-year': _body['agreementDate-year'],
      'agreementDate-month': _body['agreementDate-month'],
      'agreementDate-day': _body['agreementDate-day'],
      agreementDate: DateFormats.dateAndTimeInputsToIsoString(
        _body as ObjectWithDateParts<'agreementDate'>,
        'agreementDate',
      ).agreementDate,
      agreementSummary: _body.agreementSummary,
    }
  }

  response() {
    let response = { [this.title]: sentenceCase(this.body.agreedCaseWithCommunityHopp) }

    if (this.body.agreedCaseWithCommunityHopp === 'yes') {
      response = {
        ...response,
        [this.questions.communityHoppName]: this.body.communityHoppName,
        [this.questions.agreementDate]: DateFormats.isoDateToUIDate(this.body.agreementDate),
        [this.questions.agreementSummary]: this.body.agreementSummary,
      }
    }

    return response
  }

  previous() {
    return 'managed-by-national-security-division'
  }

  next() {
    if (this.body.agreedCaseWithCommunityHopp === 'no') {
      return 'not-esap-eligible'
    }
    return 'esap-placement-screening'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.agreedCaseWithCommunityHopp) {
      errors.agreedCaseWithCommunityHopp =
        'You must state if you have agreed the case with the Community Head of Public Protection'
    }

    if (this.body.agreedCaseWithCommunityHopp === 'yes') {
      if (!this.body.agreementDate) {
        errors.agreementDate = 'You must provide an agreement date'
      } else if (!dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'agreementDate'>, 'agreementDate')) {
        errors.agreementDate = 'The agreement date is an invalid date'
      }

      if (!this.body.communityHoppName) {
        errors.communityHoppName = 'You must provide the name of the Community Head of Public Protection'
      }

      if (!this.body.agreementSummary) {
        errors.agreementSummary = 'You must provide a summary of the reasons why this is an exempt application'
      }
    }

    return errors
  }
}
