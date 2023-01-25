import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'
import Assess from '../../form-pages/assess'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import AssessApplication from '../../form-pages/assess/assessApplication'

export default (assessment: Assessment) => {
  let { sections } = Assess

  if (informationSetAsNotReceived(assessment)) {
    sections = sections.filter(section => section.name !== AssessApplication.name)
  }

  return sections
}
