import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from '../applications/getDefaultPlacementDurationInDays'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'

export const placementDurationFromApplication = (application: Application) => {
  return (
    retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, PlacementDuration, 'duration') ||
    getDefaultPlacementDurationInDays(application)
  )
}
