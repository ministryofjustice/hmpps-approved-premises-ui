import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInWeeks } from '../applications/getDefaultPlacementDurationInWeeks'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromApplicationOrAssessment'

export const placementDurationFromApplication = (application: Application) => {
  return (
    retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, PlacementDuration, 'duration') ||
    getDefaultPlacementDurationInWeeks(application)
  )
}
