import type { ObjectWithDateParts, PageResponse, TaskListErrors, YesOrNo } from '@approved-premises/ui'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { responsesForYesNoAndCommentsSections } from '../../../utils/index'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'
import { dateBodyProperties } from '../../../utils/dateBodyProperties'

export type RequiredActionsSections = {
  additionalActions: string
  curfewsOrSignIns: string
  concernsOfUnmanagableRisk: string
  additionalRecommendations: string
}

@Page({
  name: 'required-actions',
  bodyProperties: [
    'additionalActions',
    'additionalActionsComments',
    'curfewsOrSignIns',
    'curfewsOrSignInsComments',
    'concernsOfUnmanagableRisk',
    'concernsOfUnmanagableRiskComments',
    'additionalRecommendations',
    'additionalRecommendationsComments',
    'nameOfAreaManager',
    ...dateBodyProperties('dateOfDiscussion'),
    'outlineOfDiscussion',
  ],
})
export default class RequiredActions implements TasklistPage {
  name = 'required-actions'

  title = 'Required actions to support a placement'

  sections: RequiredActionsSections = {
    additionalActions:
      'Are there any additional actions required by the probation practitioner to make a placement viable?',
    curfewsOrSignIns: 'Are any additional curfews or sign ins recommended?',
    concernsOfUnmanagableRisk:
      'Are there concerns that the person poses a potentially unmanageable risk to staff or others?',
    additionalRecommendations: 'Are there any additional recommendations for the receiving AP manager?',
  }

  areaManagerQuestions = {
    name: 'Name of area manager',
    dateOfDiscussion: 'Date of discussion',
    outlineOfDiscussion: 'Outline the discussion, including any additional measures that have been agreed.',
  }

  constructor(
    public body: {
      additionalActions: YesOrNo
      additionalActionsComments?: string
      curfewsOrSignIns: YesOrNo
      curfewsOrSignInsComments?: string
      concernsOfUnmanagableRisk: YesOrNo
      concernsOfUnmanagableRiskComments?: string
      additionalRecommendations: YesOrNo
      additionalRecommendationsComments?: string
      nameOfAreaManager?: string
      outlineOfDiscussion?: string
    } & Partial<ObjectWithDateParts<'dateOfDiscussion'>>,
  ) {
    this.body = {
      dateOfDiscussion: DateFormats.dateAndTimeInputsToIsoString(
        body as ObjectWithDateParts<'dateOfDiscussion'>,
        'dateOfDiscussion',
      ).dateOfDiscussion,
      ...this.body,
    }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    return ''
  }

  response() {
    const response: PageResponse = {}

    if (this.body.concernsOfUnmanagableRisk === 'yes') {
      response[this.areaManagerQuestions.name] = this.body.nameOfAreaManager
      response[this.areaManagerQuestions.dateOfDiscussion] = DateFormats.isoDateToUIDate(this.body.dateOfDiscussion)
      response[this.areaManagerQuestions.outlineOfDiscussion] = this.body.outlineOfDiscussion
    }
    return { ...response, ...responsesForYesNoAndCommentsSections(this.sections, this.body) } as PageResponse
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.additionalActions)
      errors.additionalActions =
        'You must state if there are additional actions required by the probation practitioner to make a placement viable'

    if (!this.body.curfewsOrSignIns)
      errors.curfewsOrSignIns = 'You must state if there are any additional curfews or sign ins recommended'

    if (this.body.curfewsOrSignIns === 'yes' && !this.body.curfewsOrSignInsComments)
      errors.curfewsOrSignInsComments = 'You must detail the additional curfews or sign ins recommended'

    if (!this.body.concernsOfUnmanagableRisk)
      errors.concernsOfUnmanagableRisk =
        'You must state if there are any concerns that the person poses an potentially unmanageable risk to staff or others'

    if (this.body.concernsOfUnmanagableRisk === 'yes') {
      if (!this.body.additionalActionsComments)
        errors.additionalActionsComments =
          'You must state the additional recommendations due to there being concerns that the person poses a potentially unmanageable risk to staff and others'

      if (dateIsBlank(this.body, 'dateOfDiscussion')) errors.dateOfDiscussion = 'You must state the date of discussion'
      else if (
        !dateAndTimeInputsAreValidDates(this.body as ObjectWithDateParts<'dateOfDiscussion'>, 'dateOfDiscussion')
      ) {
        errors.dateOfDiscussion = 'You must enter a valid date for the date of discussion'
      }
      if (!this.body.nameOfAreaManager) errors.nameOfAreaManager = 'You must state the name of the area manager'
      if (!this.body.outlineOfDiscussion) errors.outlineOfDiscussion = 'You must state the outline of the discussion'
    }

    if (!this.body.additionalRecommendations)
      errors.additionalRecommendations = 'You must state if there are any additional recommendations'

    if (this.body.additionalRecommendations === 'yes' && !this.body.additionalRecommendationsComments)
      errors.additionalRecommendationsComments = 'You must add more detail about the additional recommendations'

    return errors
  }
}
