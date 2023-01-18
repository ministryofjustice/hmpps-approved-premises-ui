import { Section } from '../../utils/decorators'
import SuitabilityAssessment from './suitablityAssessment'
import RequiredActions from './requiredActions'

@Section({
  name: 'Assess application',
  tasks: [SuitabilityAssessment, RequiredActions],
})
export default class AssessApplication {}
