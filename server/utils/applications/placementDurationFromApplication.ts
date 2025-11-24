import { Cas1Application as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const placementDurationFromApplication = (application: Application) => {
  return (
    Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'duration')) ||
    getDefaultPlacementDurationInDays(application)
  )
}
