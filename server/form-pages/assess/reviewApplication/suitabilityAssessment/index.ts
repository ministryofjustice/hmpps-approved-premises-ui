import { Task } from '../../../utils/decorators'

import SufficientInformation from './sufficientInformation'

@Task({
  slug: 'suitability-assessment',
  name: 'Check there is sufficient information to make a decision',
  pages: [SufficientInformation],
})
export default class SuitabilityAssessment {}
