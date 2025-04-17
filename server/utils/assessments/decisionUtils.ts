import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import MakeADecisionPage from '../../form-pages/assess/makeADecision/makeADecisionTask/makeADecision'
import InformationReceived from '../../form-pages/assess/reviewApplication/sufficientInformation/informationReceived'
import SufficientInformation from '../../form-pages/assess/reviewApplication/sufficientInformation/sufficientInformation'

export const notEnoughInformationFromAssessment = (assessment: Assessment): boolean => {
  const sufficientInformation: string = retrieveOptionalQuestionResponseFromFormArtifact(
    assessment,
    SufficientInformation,
    'sufficientInformation',
  )
  const informationReceived: string = retrieveOptionalQuestionResponseFromFormArtifact(
    assessment,
    InformationReceived,
    'informationReceived',
  )

  return sufficientInformation === 'no' && informationReceived === 'no'
}

export const decisionFromAssessment = (assessment: Assessment) =>
  retrieveOptionalQuestionResponseFromFormArtifact(assessment, MakeADecisionPage, 'decision') || ''

export const applicationAccepted = (assessment: Assessment) => {
  return decisionFromAssessment(assessment) === 'accept'
}
