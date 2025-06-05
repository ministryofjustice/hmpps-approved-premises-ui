import { ApprovedPremises, ApprovedPremisesApplication, Cas1PlacementRequestDetail } from '../../@types/shared'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getPreferredApsFromApplication = (
  placementRequest: Cas1PlacementRequestDetail,
): Array<ApprovedPremises> => {
  const application = placementRequest.application as ApprovedPremisesApplication
  return retrieveOptionalQuestionResponseFromFormArtifact(application, PreferredAps, 'selectedAps') || []
}
