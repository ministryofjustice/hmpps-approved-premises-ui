import type {
  ApprovedPremisesApplication as Application,
  ReleaseTypeOption,
  SubmitApplication,
} from '@approved-premises/api'
import { SentenceTypesT } from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import type { ApTypes } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

import { retrieveOptionalQuestionResponseFromApplication, retrieveQuestionResponseFromApplication } from '../utils'

export const applicationSubmissionData = (application: Application): SubmitApplication => {
  const apType = retrieveQuestionResponseFromApplication<keyof ApTypes>(application, 'type-of-ap', 'ap-type', 'type')
  const targetLocation = retrieveQuestionResponseFromApplication<string>(
    application,
    'location-factors',
    'describe-location-factors',
    'postcodeArea',
  )
  const releaseType = getReleaseType(application)

  return {
    translatedDocument: application.document,
    isPipeApplication: apType === 'pipe',
    isWomensApplication: false,
    targetLocation,
    releaseType,
  }
}

const getReleaseType = (application: Application): ReleaseTypeOption => {
  const sentenceType = retrieveQuestionResponseFromApplication<SentenceTypesT>(
    application,
    'basic-information',
    'sentence-type',
    'sentenceType',
  )

  if (sentenceType === 'communityOrder' || sentenceType === 'bailPlacement') {
    return 'in_community'
  }

  return retrieveOptionalQuestionResponseFromApplication<ReleaseTypeOption>(
    application,
    'basic-information',
    'release-type',
    'releaseType',
  )
}
