import { differenceInDays } from 'date-fns'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import { ApprovedPremisesApplication as Application, ReleaseTypeOption } from '../../@types/shared'
import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import EndDates from '../../form-pages/apply/reasons-for-placement/basic-information/endDates'
import { DateFormats } from '../dateUtils'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'

export const shouldShowContingencyPlanPartnersPages = (application: Application) => {
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

  const pssEndDate = retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, EndDates, 'pssDate')

  if (pssEndDate) return true

  return false
}

export const shouldShowContingencyPlanQuestionsPage = (application: Application) => {
  const arrivalDateString = arrivalDateFromApplication(application)

  if (!arrivalDateString) return false

  const arrivalDateObj = DateFormats.isoToDateObj(arrivalDateString)

  if (differenceInDays(arrivalDateObj, new Date()) <= 28) return true

  return false
}
