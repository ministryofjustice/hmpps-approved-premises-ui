import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import { ApprovedPremisesApplication as Application, ReleaseTypeOption } from '../../@types/shared'
import { retrieveQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromApplicationOrAssessment'

export const shouldShowContingencyPlanPages = (application: Application) => {
  let releaseType: ReleaseTypeOption
  const sentenceType = retrieveQuestionResponseFromApplicationOrAssessment(application, SentenceType, 'sentenceType')

  if (
    sentenceType === 'standardDeterminate' ||
    sentenceType === 'extendedDeterminate' ||
    sentenceType === 'ipp' ||
    sentenceType === 'life'
  ) {
    releaseType = retrieveQuestionResponseFromApplicationOrAssessment(application, ReleaseType, 'releaseType')
  }

  const apType = retrieveQuestionResponseFromApplicationOrAssessment(application, SelectApType, 'type')

  if (
    sentenceType === 'communityOrder' ||
    sentenceType === 'nonStatutory' ||
    releaseType === 'pss' ||
    apType === 'esap'
  )
    return true

  return false
}
