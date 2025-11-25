import { ApprovedPremisesApplication as Application, Cas1Assessment as Assessment } from '../../@types/shared'
import InformationReceived from '../../form-pages/assess/reviewApplication/sufficientInformation/informationReceived'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import isAssessment from './isAssessment'

export default (applicationOrAssessment: Assessment | Application): boolean => {
  if (!isAssessment(applicationOrAssessment)) return false

  if (applicationOrAssessment?.data) {
    const response = retrieveOptionalQuestionResponseFromFormArtifact(
      applicationOrAssessment,
      InformationReceived,
      'informationReceived',
    )

    return response === 'no'
  }

  return false
}
