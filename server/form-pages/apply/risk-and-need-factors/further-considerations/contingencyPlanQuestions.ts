import {
  ContingencyPlanQuestionId,
  ContingencyPlanQuestionsBody,
  ContingencyPlanQuestionsRecord,
  TaskListErrors,
} from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { ApprovedPremisesApplication as Application } from '../../../../@types/shared'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import ContingencyPlanPartners from './contingencyPlanPartners'

const questions: ContingencyPlanQuestionsRecord = {
  noReturn: {
    question: 'If the person does not return to the AP for curfew, what actions should be taken?',
    hint: 'List all actions and agencies involved. Identify who is responsible for each section.',
    error: 'You must detail the actions that should be taken if the person does not return to the AP for curfew',
  },
  placementWithdrawn: {
    question: "If the person's placement needs to be withdrawn out of hours, what actions should be taken?",
    hint: `Placements can be withdrawn due to safety, security or behavioural issues.
    List all actions and agencies involved. Identify who is responsible for each section.`,
    error:
      "You must detail any actions that should be taken if the person's placement needs to be withdrawn out of hours",
  },
  victimConsiderations: {
    question: 'Provide any victim considerations that the AP need to be aware of when out of hours',
    error: 'You must detail any victim considerations that the AP need to be aware of when out of hours',
  },
  unsuitableAddresses: {
    question:
      'In the event of an out of hours placement withdrawal, provide any unsuitable addresses that the person cannot reside at',
    hint: 'List all actions and agencies involved. Identify who is responsible for each section.',
    error: 'You must detail any unsuitable addresses that the person cannot reside at',
  },
  suitableAddresses: {
    question:
      'In the event of an out of hours placement withdrawal, provide alternative suitable addresses that the person can reside at',
    hint: 'For situations where a placement is withdrawn and recall action is not taken, the person will need to be directed to alternative places to reside in',
    error: 'You must detail alternative suitable addresses that the person can reside at',
  },
  breachInformation: {
    question: 'In the event of a breach, provide any further information to support Out of Hours (OoH) decision making',
    hint: 'For example, include any required actions or views from the probation practicioner regarding OoH recall following curfew breach',
    error: 'You must detail any further information to support OoH decision making',
  },
  otherConsiderations: {
    question: 'Are there any other considerations?',
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
      retrieveOptionalQuestionResponseFromApplicationOrAssessment(
        application,
        ContingencyPlanPartners,
        'partnerAgencyDetails',
      ) || []

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
