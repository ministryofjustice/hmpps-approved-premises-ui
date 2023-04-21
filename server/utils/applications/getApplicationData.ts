import {
  ApprovedPremisesApplication as Application,
  Assessment,
  ReleaseTypeOption,
  SubmitApplication,
  UpdateApprovedPremisesApplication,
} from '@approved-premises/api'

import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import SelectApType, { ApType } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromApplicationOrAssessment,
} from '../retrieveQuestionResponseFromApplicationOrAssessment'
import DescribeLocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'

type FirstClassFields<T> = T extends UpdateApprovedPremisesApplication
  ? Omit<UpdateApprovedPremisesApplication, 'data'>
  : T extends SubmitApplication
  ? Omit<SubmitApplication, 'translatedDocument'>
  : never

type QuestionResponseFunction = (
  applicationOrAssessment: Application | Assessment,
  Page: unknown,
  question?: string,
) => unknown

export const getApplicationUpdateData = (application: Application): UpdateApprovedPremisesApplication => {
  return {
    data: application.data,
    ...getUpdateFirstClassFields(application),
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApplication => {
  return {
    translatedDocument: application.document,
    ...getSubmitFirstClassFields(application),
  }
}

const firstClassFields = <T>(
  application: Application,
  retrieveQuestionResponse: QuestionResponseFunction,
): FirstClassFields<T> => {
  const apType = retrieveQuestionResponse(application, SelectApType, 'type') as ApType
  const targetLocation = retrieveQuestionResponse(application, DescribeLocationFactors, 'postcodeArea')
  const releaseType = getReleaseType(application, retrieveQuestionResponse)
  const arrivalDate = arrivalDateFromApplication(application, false)

  return {
    isWomensApplication: false,
    isPipeApplication: isPipeApplication(apType),
    targetLocation,
    releaseType,
    arrivalDate,
  } as FirstClassFields<T>
}

const getUpdateFirstClassFields = (application: Application): FirstClassFields<UpdateApprovedPremisesApplication> => {
  return firstClassFields(application, retrieveOptionalQuestionResponseFromApplicationOrAssessment)
}

const getSubmitFirstClassFields = (application: Application): FirstClassFields<SubmitApplication> => {
  return firstClassFields(application, retrieveQuestionResponseFromApplicationOrAssessment)
}

const getReleaseType = (
  application: Application,
  retrieveQuestionResponse: QuestionResponseFunction,
): ReleaseTypeOption => {
  const sentenceType = retrieveQuestionResponse(application, SentenceType, 'sentenceType')

  if (sentenceType === 'communityOrder' || sentenceType === 'bailPlacement') {
    return 'in_community'
  }

  return retrieveOptionalQuestionResponseFromApplicationOrAssessment(application, ReleaseType, 'releaseType')
}

const isPipeApplication = (apType?: ApType): boolean | undefined => {
  if (apType === undefined) {
    return undefined
  }

  return apType === 'pipe'
}
