import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { BackwardsCompatibleApplyApType } from '@approved-premises/ui'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const getDefaultPlacementDurationInDays = (application: Application) => {
  const apType = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    SelectApType,
    'type',
  ) as BackwardsCompatibleApplyApType

  if (['standard', 'normal', 'mhapElliottHouse', 'mhapStJosephs', 'rfap'].includes(apType)) {
    return 12 * 7
  }
  if (apType === 'pipe') return 26 * 7
  if (apType === 'esap') return 52 * 7
  return null
}
