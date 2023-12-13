import { ApprovedPremises, ApprovedPremisesApplication, PlacementRequestDetail } from '../../@types/shared'
import PreferredAps from '../../form-pages/apply/risk-and-need-factors/location-factors/preferredAps'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getPreferredApsFromApplication = (placementRequest: PlacementRequestDetail): Array<ApprovedPremises> => {
  const application = placementRequest.application as ApprovedPremisesApplication
  return retrieveOptionalQuestionResponseFromFormArtifact(application, PreferredAps, 'selectedAps') || []
}
