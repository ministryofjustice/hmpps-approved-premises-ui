import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import { ApprovedPremisesApplication as Application, ReleaseTypeOption } from '../../@types/shared'
import { retrieveQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'

export const shouldShowContingencyPlanPages = (application: Application) => {
  let releaseType: ReleaseTypeOption
  const sentenceType = retrieveQuestionResponseFromFormArtifact(application, SentenceType, 'sentenceType')

  if (
    sentenceType === 'standardDeterminate' ||
    sentenceType === 'extendedDeterminate' ||
    sentenceType === 'ipp' ||
    sentenceType === 'life'
  ) {
    releaseType = retrieveQuestionResponseFromFormArtifact(application, ReleaseType, 'releaseType')
  }

  const apType = retrieveQuestionResponseFromFormArtifact(application, SelectApType, 'type')

  if (
    sentenceType === 'communityOrder' ||
    sentenceType === 'nonStatutory' ||
    releaseType === 'pss' ||
    apType === 'esap'
  )
    return true

  return false
}
