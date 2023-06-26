import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import SelectApType, { ApType } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getDefaultPlacementDurationInDays = (application: Application) => {
  const apType = retrieveQuestionResponseFromFormArtifact(application, SelectApType, 'type') as ApType

  if (apType === 'standard') return 12 * 7
  if (apType === 'pipe') return 26 * 7
  if (apType === 'esap') return 52 * 7
  return null
}
