import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { responsesForYesNoAndCommentsSections } from '../../../utils/index'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

export type SuitabilityAssessmentSection = {
  riskFactors: string
  riskManagement: string
  locationOfPlacement: string
  moveOnPlan: string
}

@Page({
  name: 'suitability-assessment',
  bodyProperties: [
    'riskFactors',
    'riskFactorsComments',
    'riskManagement',
    'riskManagementComments',
    'locationOfPlacement',
    'locationOfPlacementComments',
    'moveOnPlan',
    'moveOnPlanComments',
  ],
})
export default class SuitabilityAssessment implements TasklistPage {
  name = 'suitability-assessment' as const

  title = 'Suitability assessment'

  sections: SuitabilityAssessmentSection = {
    riskFactors: 'Does the application identify the risk factors that an Approved Premises (AP) placement can support?',
    riskManagement: 'Does the application explain how an AP placement would be beneficial for risk management?',
    locationOfPlacement: 'Are there factors to consider regarding the location of placement?',
    moveOnPlan: 'Is the move on plan sufficient?',
  }

  constructor(
    public body: {
      riskFactors: YesOrNo
      riskFactorsComments?: string
      riskManagement: YesOrNo
      riskManagementComments?: string
      locationOfPlacement: YesOrNo
      locationOfPlacementComments?: string
      moveOnPlan: YesOrNo
      moveOnPlanComments?: string
    },
    private readonly assessment: Assessment,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return suitabilityAssessmentAdjacentPage(this.assessment, this.name)
  }

  response() {
    return responsesForYesNoAndCommentsSections(this.sections, this.body)
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskFactors)
      errors.riskFactors =
        'You must confirm if the application identifies the risk factors that an AP placement can support'

    if (!this.body.riskManagement)
      errors.riskManagement =
        'You must confirm if the application explains how an AP placement would be beneficial for risk management'

    if (!this.body.locationOfPlacement)
      errors.locationOfPlacement = 'You must confirm if there factors to consider regarding the location of placement'

    if (!this.body.moveOnPlan) errors.moveOnPlan = 'You must confirm if the move on plan is sufficient'

    return errors
  }
}
