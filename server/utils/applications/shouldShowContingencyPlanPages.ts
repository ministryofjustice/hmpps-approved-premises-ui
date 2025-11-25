import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import { Cas1Application as Application, ReleaseTypeOption } from '../../@types/shared'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import RelevantDates from '../../form-pages/apply/reasons-for-placement/basic-information/relevantDates'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

export const shouldShowContingencyPlanPartnersPages = (application: Application) => {
  let releaseType: ReleaseTypeOption
  const sentenceType = retrieveOptionalQuestionResponseFromFormArtifact(application, SentenceType, 'sentenceType')

  if (
    sentenceType === 'standardDeterminate' ||
    sentenceType === 'extendedDeterminate' ||
    sentenceType === 'ipp' ||
    sentenceType === 'life'
  ) {
    releaseType = retrieveOptionalQuestionResponseFromFormArtifact(application, ReleaseType, 'releaseType')
  }

  const apType = retrieveOptionalQuestionResponseFromFormArtifact(application, SelectApType, 'type')

  if (
    sentenceType === 'communityOrder' ||
    sentenceType === 'nonStatutory' ||
    releaseType === 'pss' ||
    apType === 'esap'
  )
    return true

  const pssDate = retrieveOptionalQuestionResponseFromFormArtifact(application, RelevantDates, 'pssDate')
  const pssEndDate = retrieveOptionalQuestionResponseFromFormArtifact(application, RelevantDates, 'pssEndDate')

  if (pssEndDate || pssDate) return true

  return false
}

export const shouldShowContingencyPlanQuestionsPage = (application: Application) =>
  noticeTypeFromApplication(application) === 'shortNotice' || noticeTypeFromApplication(application) === 'emergency'
