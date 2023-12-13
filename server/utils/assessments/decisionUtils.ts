import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import MakeADecisionPage from '../../form-pages/assess/makeADecision/makeADecisionTask/makeADecision'

export const decisionFromAssessment = (assessment: Assessment) =>
  retrieveOptionalQuestionResponseFromFormArtifact(assessment, MakeADecisionPage, 'decision') || ''

export const applicationAccepted = (assessment: Assessment) => {
  return decisionFromAssessment(assessment) === 'accept'
}
