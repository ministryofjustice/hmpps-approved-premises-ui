import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'
import ApplicationTimeliness from './applicationTimeliness'
import RfapSuitability from './rfapSuitability'
import ContingencyPlanSuitability from './contingencyPlanSuitability'
import PipeSuitability from './pipeSuitability'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [
    SuitabilityAssessmentPage,
    RfapSuitability,
    PipeSuitability,
    ApplicationTimeliness,
    ContingencyPlanSuitability,
  ],
})
export default class SuitabilityAssessment {}
