import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'
import ApplicationTimeliness from './applicationTimeliness'
import RfapSuitability from './rfapSuitability'
import ContingencyPlanSuitability from './contingencyPlanSuitability'
import PipeSuitability from './pipeSuitability'
import EsapSuitability from './esapSuitability'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [
    SuitabilityAssessmentPage,
    RfapSuitability,
    PipeSuitability,
    EsapSuitability,
    ApplicationTimeliness,
    ContingencyPlanSuitability,
  ],
})
export default class SuitabilityAssessment {}
