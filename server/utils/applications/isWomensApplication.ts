import type { ApprovedPremisesApplication as Application, FullPerson } from '@approved-premises/api'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'

export const isWomensApplication = (application: Application): boolean => {
  const { sex } = application.person as FullPerson
  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    MaleAp,
    'shouldPersonBePlacedInMaleAp',
  )
  return sex === 'Female' || shouldPersonBePlacedInMaleAp === 'no'
}
