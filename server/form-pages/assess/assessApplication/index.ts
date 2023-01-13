import { Section } from '../../utils/decorators'
import SuitabilityAssessment from './suitablityAssessment'

@Section({
  name: 'Assess application',
  tasks: [SuitabilityAssessment],
})
export default class AssessApplication {}
