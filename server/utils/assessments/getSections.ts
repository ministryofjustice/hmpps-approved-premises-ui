import { ApprovedPremisesAssessment as Assessment } from '../../@types/shared'
import Assess from '../../form-pages/assess'
import informationSetAsNotReceived from './informationSetAsNotReceived'
import AssessApplication from '../../form-pages/assess/assessApplication'
import MatchingInformation from '../../form-pages/assess/matchingInformation'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'

export default (assessment: Assessment) => {
  let { sections } = Assess

  if (informationSetAsNotReceived(assessment)) {
    sections = sections.filter(section => section.name !== AssessApplication.name)
  }

  if (decisionFromAssessment(assessment) && !applicationAccepted(assessment)) {
    sections = sections.filter(section => section.name !== MatchingInformation.name)
  }

  return sections
}
