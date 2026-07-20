import { Cas1Application as Application } from '@approved-premises/api'
import { DataServices } from '@approved-premises/ui'
import PlacementDuration from '../../form-pages/apply/move-on/placementDuration'
import { getDefaultPlacementDurationInDays } from './getDefaultPlacementDurationInDays'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const placementDurationFromApplication = async (
  application: Application,
  dataservices: DataServices,
  token: string,
) => {
  return (
    Number(retrieveOptionalQuestionResponseFromFormArtifact(application, PlacementDuration, 'duration')) ||
    getDefaultPlacementDurationInDays(application, dataservices, token)
  )
}
