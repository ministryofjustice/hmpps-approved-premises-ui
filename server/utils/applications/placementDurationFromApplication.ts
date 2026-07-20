import { Cas1Application as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const placementDurationFromApplication = (application: Application): number =>
  Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'duration')) ||
  Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'defaultDurationDays'))
