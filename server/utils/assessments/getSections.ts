import { Cas1Assessment as Assessment } from '../../@types/shared'
import Assess from '../../form-pages/assess'
import MatchingInformation from '../../form-pages/assess/matchingInformation'
import AssessApplication from '../../form-pages/assess/assessApplication'
import { applicationAccepted, decisionFromAssessment, notEnoughInformationFromAssessment } from './decisionUtils'

export default (assessment: Assessment) => {
  let { sections } = Assess

  if (decisionFromAssessment(assessment) && !applicationAccepted(assessment)) {
    sections = sections.filter(section => section.name !== MatchingInformation.name)
  }

  if (notEnoughInformationFromAssessment(assessment)) {
    sections = sections.filter(section => section.name !== AssessApplication.name)
  }

  return sections
}
