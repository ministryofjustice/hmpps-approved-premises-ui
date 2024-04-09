import { ApprovedPremisesAssessment } from '@approved-premises/api'

import Assess from '../../../server/form-pages/assess'
import TasklistPage, { TasklistPageInterface } from '../../../server/form-pages/tasklistPage'
import FormPage from '../formPage'
import { keyDetails } from '../../../server/utils/assessments/utils'
import { FeatureFlags } from '../../../server/services/featureFlagService'

export default class AssessPage extends FormPage {
  tasklistPage: TasklistPage

  constructor(
    title: string,
    assessment: ApprovedPremisesAssessment,
    taskName: string,
    pageName: string,
    backLink?: string,
    featureFlags?: Partial<FeatureFlags>,
  ) {
    super(title, backLink, false)

    const Class = Assess.pages[taskName][pageName] as TasklistPageInterface

    this.tasklistPage = new Class(assessment.data?.[taskName]?.[pageName], assessment, featureFlags)
    this.shouldShowKeyDetails(keyDetails(assessment))
  }
}
