import { Section } from '../../utils/decorators'

import ReviewApplicationAndDocuments from './reviewApplicationAndDocuments'
import SuitabilityAssessment from './suitabilityAssessment'

@Section({
  name: 'Review application',
  tasks: [ReviewApplicationAndDocuments, SuitabilityAssessment],
})
export default class ReviewApplication {}
