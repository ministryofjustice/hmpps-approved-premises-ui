import {
  ApprovedPremisesApplication as Application,
  ReleaseTypeOption,
  SubmitApprovedPremisesApplication,
  UpdateApprovedPremisesApplication,
} from '@approved-premises/api'

import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import SelectApType, { ApType } from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

import {
  retrieveOptionalQuestionResponseFromApplicationOrAssessment,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import DescribeLocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'
import { FormArtifact } from '../../@types/ui'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

type FirstClassFields<T> = T extends UpdateApprovedPremisesApplication
  ? Omit<UpdateApprovedPremisesApplication, 'data'>
  : T extends SubmitApprovedPremisesApplication
  ? Omit<SubmitApprovedPremisesApplication, 'translatedDocument'>
  : never

type QuestionResponseFunction = (formArtifact: FormArtifact, Page: unknown, question?: string) => unknown

export const getApplicationUpdateData = (application: Application): UpdateApprovedPremisesApplication => {
  return {
    data: application.data,
    isInapplicable: isInapplicable(application),
    ...getUpdateFirstClassFields(application),
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApprovedPremisesApplication => {
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
  const arrivalDate = arrivalDateFromApplication(application)
  const isEmergencyApplication = noticeTypeFromApplication(application) === 'emergency'

  return {
    isWomensApplication: false,
    isPipeApplication: isPipeApplication(apType),
    isEsapApplication: isEsapApplication(apType),
    targetLocation,
    releaseType,
    arrivalDate,
    isEmergencyApplication,
  } as FirstClassFields<T>
}

const getUpdateFirstClassFields = (application: Application): FirstClassFields<UpdateApprovedPremisesApplication> => {
  return firstClassFields(application, retrieveOptionalQuestionResponseFromApplicationOrAssessment)
}

const getSubmitFirstClassFields = (application: Application): FirstClassFields<SubmitApprovedPremisesApplication> => {
  return firstClassFields(application, retrieveQuestionResponseFromFormArtifact)
}

const getReleaseType = (
  application: Application,
  retrieveQuestionResponse: QuestionResponseFunction,
): ReleaseTypeOption => {
  const sentenceType = retrieveQuestionResponse(application, SentenceType, 'sentenceType')

  if (sentenceType === 'nonStatutory') {
    return 'not_applicable'
  }

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

const isEsapApplication = (apType?: ApType): boolean | undefined => {
  if (apType === undefined) {
    return undefined
  }

  return apType === 'esap'
}
