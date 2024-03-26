import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'
import ApplicationTimeliness from './applicationTimeliness'
import RfapSuitability from './rfapSuitability'
import ContingencyPlanSuitability from './contingencyPlanSuitability'
import PipeSuitability from './pipeSuitability'
import EsapSuitability from './esapSuitability'
import MhapSuitability from './mhapSuitability'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [
    SuitabilityAssessmentPage,
    RfapSuitability,
    PipeSuitability,
    EsapSuitability,
    MhapSuitability,
    ApplicationTimeliness,
    ContingencyPlanSuitability,
  ],
})
export default class SuitabilityAssessment {}
