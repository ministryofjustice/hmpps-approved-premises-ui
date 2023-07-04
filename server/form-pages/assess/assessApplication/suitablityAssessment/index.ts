import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'
import ApplicationTimeliness from './applicationTimeliness'
import RfapSuitability from './rfapSuitability'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [SuitabilityAssessmentPage, RfapSuitability, ApplicationTimeliness],
})
export default class SuitabilityAssessment {}
