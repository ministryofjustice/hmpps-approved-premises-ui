import {
  ContingencyPlanQuestionId,
  ContingencyPlanQuestionsBody,
  ContingencyPlanQuestionsRecord,
  TaskListErrors,
} from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication as Application } from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ContingencyPlanPartners from './contingencyPlanPartners'

const questions: ContingencyPlanQuestionsRecord = {
  noReturn: {
    question: 'If the person does not return to the AP for curfew, what actions should be taken?',
    hint: 'List all actions and agencies who may need to be informed and when. AP staff will contact the Out of Hours manager if a person does not return for curfew who will consider whether recall action should be taken. Identify any information which should be taken into account by AP staff in the event of a failure to return for curfew. This is particularly important for people who are subject to post sentence supervision.',
    error: 'You must detail the actions that should be taken if the person does not return to the AP for curfew',
  },
  placementWithdrawn: {
    question: "If the person's placement needs to be withdrawn out of hours, what actions should be taken?",
    hint: `Placements can be withdrawn due to safety, security or behavioural issues. 
    Identify circumstances in which recall should be sought (if applicable). 
    If there are alternative locations that a person can be placed until the next working day, please identify this and provide the address and contact information in the boxes below. 
    This is particularly important for people who are subject to post sentence supervision.`,
    error:
      "You must detail any actions that should be taken if the person's placement needs to be withdrawn out of hours",
  },
  victimConsiderations: {
    question: 'Provide any victim considerations that the AP need to be aware of when out of hours',
    hint: 'In the event of a persons whereabouts becoming unknown out of hours, identify if there are any actions required in respect of victims.',
    error: 'You must detail any victim considerations that the AP need to be aware of when out of hours',
  },
  unsuitableAddresses: {
    question:
      'In the event of an out of hours placement withdrawal, provide any unsuitable addresses that the person cannot reside at',
    hint: `Identify any addresses which are unsuitable for the person to be placed in the event of out of hours placement withdrawal. 
    This is particularly important for people who are subject to post sentence supervision.`,
    error: 'You must detail any unsuitable addresses that the person cannot reside at',
  },
  suitableAddresses: {
    question:
      'In the event of an out of hours placement withdrawal, provide alternative suitable addresses that the person can reside at',
    hint: `Identify any addresses which have been assessed as suitable for the person to be placed in the event of out of hours placement withdrawal. 
    This may include addresses which are planned for move on. 
    This is particularly important for people who are subject to post sentence supervision.
    Provide address and contact information.`,
    error: 'You must detail alternative suitable addresses that the person can reside at',
  },
  breachInformation: {
    question: 'In the event of a breach, provide any further information to support Out of Hours (OoH) decision making',
    hint: 'For example, include any required actions or views from the probation practitioner regarding OoH recall following curfew breach.',
    error: 'You must detail any further information to support OoH decision making',
  },
  otherConsiderations: {
    question: 'Are there any other considerations?',
    hint: 'Add any further information which would be helpful for Approved Premises staff in managing issues out of hours that is not covered by the above questions.',
    error: 'You must detail any other considerations',
  },
} as const

const bodyProperties = Object.keys(questions) as Array<ContingencyPlanQuestionId>

@Page({
  name: 'contingency-plan-questions',
  bodyProperties,
})
export default class ContingencyPlanQuestions implements TasklistPage {
  title = 'Contingency plans'

  questions: ContingencyPlanQuestionsRecord = questions

  contingencyPlanPartnerNames: Array<string>

  constructor(
    public body: ContingencyPlanQuestionsBody,
    private readonly application: Application,
  ) {
    const contingencyPlanPartners =
      retrieveOptionalQuestionResponseFromFormArtifact(application, ContingencyPlanPartners, 'partnerAgencyDetails') ||
      []

    const contingencyPlanPartnersNames = contingencyPlanPartners.map(
      (partner: { partnerAgencyName: string }) => partner.partnerAgencyName,
    )

    this.contingencyPlanPartnerNames = contingencyPlanPartnersNames
  }

  previous() {
    return 'contingency-plan-partners'
  }

  next() {
    return 'trigger-plan'
  }

  response() {
    const response = {}

    Object.entries(this.body).forEach(([key, value]) => {
      response[this.questions[key].question] = value
    })

    return response
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    bodyProperties.forEach(key => {
      if (!this.body[key]) {
        errors[key] = this.questions[key].error
      }
    })

    return errors
  }
}
