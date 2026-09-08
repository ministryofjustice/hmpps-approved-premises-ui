import { Cas1Application as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const calculatedPlacementDurationFromApplication = (application: Application): number | undefined => {
  const defaultDurationDays = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    PlacementDuration,
    'defaultDurationDays',
  )

  return defaultDurationDays ? Number(defaultDurationDays) : undefined
}
