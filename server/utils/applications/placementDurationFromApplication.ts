import { Cas1Application as Application } from '@approved-premises/api'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

/**
Returns the duration in days from the application.
Before submission, it will come fron the application data, either 'duration' if the user has overriden the default duration or 
'defaultDurationDays' which will be populated from the API calculation endpoint.
After submission, it will come from the duration first-class field persisted in the application
*/
export const placementDurationFromApplication = (application: Application): number =>
  application.duration ||
  Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'duration')) ||
  Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'defaultDurationDays'))
