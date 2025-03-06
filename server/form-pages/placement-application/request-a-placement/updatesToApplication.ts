import type { PageResponse, TaskListErrors, YesOrNoWithDetail } from '@approved-premises/ui'

import { Page } from '../../utils/decorators'
import { yesOrNoResponseWithDetailForYes } from '../../utils'

import TasklistPage from '../../tasklistPage'
import { PlacementApplication } from '../../../@types/shared'
import { applicationLink } from '../../../utils/placementRequests/applicationLink'
import { retrieveQuestionResponseFromFormArtifact } from '../../../utils/retrieveQuestionResponseFromFormArtifact'
import ReasonForPlacement from './reasonForPlacement'

export type Body = YesOrNoWithDetail<'significantEvents'> &
  YesOrNoWithDetail<'changedCirumstances'> &
  YesOrNoWithDetail<'riskFactors'> &
  YesOrNoWithDetail<'accessOrHealthcareNeeds'> &
  YesOrNoWithDetail<'locationFactors'>

@Page({
  name: 'updates-to-application',
  bodyProperties: [
    'significantEvents',
    'significantEventsDetail',
    'changedCirumstances',
    'changedCirumstancesDetail',
    'riskFactors',
    'riskFactorsDetail',
    'accessOrHealthcareNeeds',
    'accessOrHealthcareNeedsDetail',
    'locationFactors',
    'locationFactorsDetail',
  ],
})
export default class UpdatesToApplication implements TasklistPage {
  title = 'Updates to application'

  questions = {
    significantEvents: 'Have there been any significant events since the application was assessed?',
    changedCirumstances: "Has the person's circumstances changed which affect the planned AP placement?",
    riskFactors: "Has the person's risk factors changed since the application was assessed?",
    accessOrHealthcareNeeds: "Has the person's access or healthcare needs changed since the application was assessed?",
    locationFactors: "Has the person's location factors changed since the application was assessed?",
  }

  hints = {
    significantEvents: 'For example, the person has been recalled or committed a new offence',
    riskFactors: 'For example, the person recently caused a fire in their prison cell',
    accessOrHealthcareNeeds: 'For example, the person now requires a wheelchair accessible room',
    locationFactors: 'For example, the person can no longer reside in a certain area',
  }

  applicationLink: string

  placementApplication: PlacementApplication

  constructor(
    public body: Partial<Body>,
    placementApplication: PlacementApplication,
  ) {
    this.applicationLink = applicationLink(placementApplication, 'View application', 'View application')
    this.placementApplication = placementApplication
  }

  previous() {
    const reasonForPlacement = retrieveQuestionResponseFromFormArtifact(
      this.placementApplication,
      ReasonForPlacement,
      'reason',
    )

    if (reasonForPlacement === 'rotl') {
      return 'dates-of-placement'
    }

    if (reasonForPlacement === 'additional_placement') {
      return 'additional-placement-details'
    }

    if (reasonForPlacement === 'release_following_decision') {
      return 'additional-documents'
    }

    throw new Error('Unknown reason for placement')
  }

  next() {
    return 'check-your-answers'
  }

  response() {
    const response: PageResponse = {}

    response[this.questions.significantEvents] = yesOrNoResponseWithDetailForYes('significantEvents', this.body)
    response[this.questions.changedCirumstances] = yesOrNoResponseWithDetailForYes('changedCirumstances', this.body)
    response[this.questions.riskFactors] = yesOrNoResponseWithDetailForYes('riskFactors', this.body)
    response[this.questions.accessOrHealthcareNeeds] = yesOrNoResponseWithDetailForYes(
      'accessOrHealthcareNeeds',
      this.body,
    )
    response[this.questions.locationFactors] = yesOrNoResponseWithDetailForYes('locationFactors', this.body)

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    const messages = {
      significantEvents: {
        responseMissing: 'You must state if there have been any significant events since the application was assessed',
        detailMissing: 'You must provide details of any significant events since the application was assessed',
      },
      changedCirumstances: {
        responseMissing: "You must state if the person's circumstances changed which affect the planned AP placement?",
        detailMissing: 'You must provide details of the changed circumstances',
      },
      riskFactors: {
        responseMissing: "You must state if the person's risk factors changed since the application was assessed",
        detailMissing: 'You must provide details of any changed risk factors',
      },
      accessOrHealthcareNeeds: {
        responseMissing:
          "You must state if the person's access or healthcare needs changed since the application was assessed",
        detailMissing: "You must provide details of the person's changed access or healthcare needs",
      },
      locationFactors: {
        responseMissing: "You must state if the person's location factors changed since the application was assessed",
        detailMissing: 'You must provide details of any changed location factors',
      },
    }

    Object.keys(messages).forEach(question => {
      const response = this.body[question as keyof Body]
      const detail = this.body[`${question}Detail` as keyof Body]

      if (!response) {
        errors[question as keyof this['body']] = messages[question as keyof typeof messages].responseMissing
      } else if (response === 'yes' && !detail) {
        errors[`${question}Detail` as keyof this['body']] = messages[question as keyof typeof messages].detailMissing
      }
    })

    return errors
  }
}
