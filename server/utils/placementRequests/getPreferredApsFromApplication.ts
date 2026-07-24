import { ApprovedPremises } from '@approved-premises/ui'
import { Cas1Application as Application, Cas1PlacementRequestDetail } from '../../@types/shared'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getPreferredApsFromApplication = (
  placementRequest: Cas1PlacementRequestDetail,
): Array<ApprovedPremises> => {
  const application = placementRequest.application as Application
  return retrieveOptionalQuestionResponseFromFormArtifact(application, PreferredAps, 'selectedAps') || []
}
