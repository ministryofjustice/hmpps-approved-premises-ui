import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'
import MakeADecisionPage from '../../form-pages/assess/makeADecision/makeADecisionTask/makeADecision'

export const decisionFromAssessment = (assessment: Assessment) =>
  retrieveOptionalQuestionResponseFromApplicationOrAssessment(assessment, MakeADecisionPage, 'decision') || ''

export const applicationAccepted = (assessment: Assessment) => {
  return decisionFromAssessment(assessment) === 'accept'
}
