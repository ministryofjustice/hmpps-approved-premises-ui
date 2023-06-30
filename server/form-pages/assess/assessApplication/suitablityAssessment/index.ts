import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'
import ApplicationTimeliness from './applicationTimeliness'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [SuitabilityAssessmentPage, ApplicationTimeliness],
})
export default class SuitabilityAssessment {}
