import type { ApprovedPremisesApplication as Application, FullPerson } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsPersonTransgender from '../../form-pages/apply/reasons-for-placement/basic-information/isPersonTransgender'

export const isWomensApplication = (application: Application): boolean => {
  const { sex } = application.person as FullPerson
  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    MaleAp,
    'shouldPersonBePlacedInMaleAp',
  )
  const transgenderOrHasTransgenderHistory = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    IsPersonTransgender,
    'transgenderOrHasTransgenderHistory',
  )
  const transgenderOverride = transgenderOrHasTransgenderHistory === 'yes' && shouldPersonBePlacedInMaleAp
  return transgenderOverride ? transgenderOverride === 'no' : sex === 'Female'
}
