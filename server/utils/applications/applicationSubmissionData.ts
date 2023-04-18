import type {
  ApprovedPremisesApplication as Application,
  ReleaseTypeOption,
  SubmitApplication,
} from '@approved-premises/api'
import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import DescribeLocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'

import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from '../retrieveQuestionResponseFromApplicationOrAssessment'

export const applicationSubmissionData = (application: Application): SubmitApplication => {
  const apType = retrieveQuestionResponseFromApplicationOrAssessment(application, SelectApType, 'type')
  const targetLocation = retrieveQuestionResponseFromApplicationOrAssessment(
    application,
    DescribeLocationFactors,
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
  const sentenceType = retrieveQuestionResponseFromApplicationOrAssessment(application, SentenceType, 'sentenceType')

  if (sentenceType === 'communityOrder' || sentenceType === 'bailPlacement') {
    return 'in_community'
  }

  return retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, ReleaseType, 'releaseType')
}
