import { Task } from '../../../utils/decorators'

import SuitabilityAssessmentPage from './suitabilityAssessment'

@Task({
  slug: 'suitability-assessment',
  name: 'Assess suitability of application',
  pages: [SuitabilityAssessmentPage],
})
export default class SuitabilityAssessment {}
