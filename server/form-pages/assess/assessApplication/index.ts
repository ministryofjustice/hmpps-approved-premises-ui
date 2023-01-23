import { Section } from '../../utils/decorators'
import SuitabilityAssessment from './suitablityAssessment'
import RequiredActions from './requiredActions'

@Section({
  title: 'Assess application',
  tasks: [SuitabilityAssessment, RequiredActions],
})
export default class AssessApplication {}
