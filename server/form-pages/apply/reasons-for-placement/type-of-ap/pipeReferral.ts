import type { ObjectWithDateParts, TaskListErrors, YesOrNo } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { convertToTitleCase } from '../../../../utils/utils'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

type PipeReferralBody = ObjectWithDateParts<'opdPathwayDate'> & { opdPathway: YesOrNo }

@Page({
  name: 'pipe-referral',
  bodyProperties: ['opdPathway', ...dateBodyProperties('opdPathwayDate')],
})
export default class PipeReferral implements TasklistPage {
  name = 'pipe-referral'

  get nameOrPlaceholderCopy() {
    return nameOrPlaceholderCopy(this.application.person)
  }

  title = `Has ${this.nameOrPlaceholderCopy} been screened into the Offender Personality Disorder Pathway (OPD)?`

  questions = {
    opdPathway: this.title,
    opdPathwayDate: `When was ${this.nameOrPlaceholderCopy}'s last consultation or formulation?`,
  }

  constructor(
    private _body: Partial<PipeReferralBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  public set body(value: Partial<PipeReferralBody>) {
    this._body = {
      opdPathway: value.opdPathway as YesOrNo,
    }
    if (value.opdPathway === 'yes') {
      this._body = {
        opdPathway: value.opdPathway as YesOrNo,
        'opdPathwayDate-year': value['opdPathwayDate-year'] as string,
        'opdPathwayDate-month': value['opdPathwayDate-month'] as string,
        'opdPathwayDate-day': value['opdPathwayDate-day'] as string,
        opdPathwayDate: DateFormats.dateAndTimeInputsToIsoString(
          value as ObjectWithDateParts<'opdPathwayDate'>,
          'opdPathwayDate',
        ).opdPathwayDate,
      }
    }
  }

  public get body(): PipeReferralBody {
    return this._body as PipeReferralBody
  }

  next() {
    return 'pipe-opd-screening'
  }

  previous() {
    return 'ap-type'
  }

  response() {
    const response = {
      [this.questions.opdPathway]: convertToTitleCase(this.body.opdPathway),
    } as Record<string, string>

    if (this.body.opdPathway === 'yes') {
      response[this.questions.opdPathwayDate] = DateFormats.isoDateToUIDate(this.body.opdPathwayDate)
    }

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.opdPathway) {
      errors.opdPathway = `You must specify if ${this.nameOrPlaceholderCopy} has been screened into the OPD pathway`
    }

    if (this.body.opdPathway === 'yes') {
      if (dateIsBlank(this.body, 'opdPathwayDate')) {
        errors.opdPathwayDate = 'You must enter an OPD Pathway date'
      } else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'opdPathwayDate'>, 'opdPathwayDate')
      ) {
        errors.opdPathwayDate = 'The OPD Pathway date is an invalid date'
      }
    }

    return errors
  }
}
