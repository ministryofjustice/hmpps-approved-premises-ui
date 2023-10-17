import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '../../@types/shared'
import { FormSection } from '../../@types/ui'
import AssessApplication from '../../form-pages/assess/assessApplication'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import isAssessment from './isAssessment'

export const filterSectionTasks = (section: FormSection, applicationOrAssessment: Assessment | Application) => {
  if (!isAssessment(applicationOrAssessment) || section.name !== AssessApplication.name) return section

  if (informationSetAsNotReceived(applicationOrAssessment)) {
    return { ...section, tasks: section.tasks.filter(t => t.id !== 'required-actions') }
  }

  return section
}
