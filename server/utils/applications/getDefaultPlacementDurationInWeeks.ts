import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import SelectApType, { ApType } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getDefaultPlacementDurationInWeeks = (application: Application) => {
  const apType = retrieveQuestionResponseFromFormArtifact(application, SelectApType, 'type') as ApType

  if (apType === 'standard') return 12
  if (apType === 'pipe') return 26
  if (apType === 'esap') return 52
  return null
}
