import {
  Cas1Application as Application,
  Cas1RequestedPlacementPeriod,
  ReleaseTypeOption,
  SentenceTypeOption,
  SubmitApprovedPremisesApplication,
  UpdateApprovedPremisesApplication,
} from '@approved-premises/api'

import ReleaseType from '../../form-pages/apply/reasons-for-placement/basic-information/releaseType'
import SentenceType from '../../form-pages/apply/reasons-for-placement/basic-information/sentenceType'
import SelectApType from '../../form-pages/apply/reasons-for-placement/type-of-ap/apType'

import {
  retrieveOptionalQuestionResponseFromFormArtifact,
  retrieveQuestionResponseFromFormArtifact,
} from '../retrieveQuestionResponseFromFormArtifact'
import DescribeLocationFactors from '../../form-pages/apply/risk-and-need-factors/location-factors/describeLocationFactors'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'
import { BackwardsCompatibleApplyApType, DataServices, FormArtifact } from '../../@types/ui'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'
import Situation from '../../form-pages/apply/reasons-for-placement/basic-information/situation'
import ConfirmYourDetails from '../../form-pages/apply/reasons-for-placement/basic-information/confirmYourDetails'
import { applicantAndCaseManagerDetails } from './applicantAndCaseManagerDetails'
import { reasonForShortNoticeDetails } from './reasonForShortNoticeDetails'
import { isWomensApplication } from './isWomensApplication'
import { licenceExpiryDateFromApplication } from './licenceExpiryDateFromApplication'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { substituteReleaseType } from '../placementApplications'

type FirstClassFields<T> = T extends UpdateApprovedPremisesApplication
  ? Omit<UpdateApprovedPremisesApplication, 'data'>
  : T extends SubmitApprovedPremisesApplication
    ? Omit<SubmitApprovedPremisesApplication, 'translatedDocument'>
    : never

type QuestionResponseFunction = (formArtifact: FormArtifact, Page: unknown, question?: string) => unknown

export const getApplicationUpdateData = async (
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<UpdateApprovedPremisesApplication> => {
  return {
    data: application.data,
    document: application.document,
    isInapplicable: isInapplicable(application),
    ...(await getUpdateFirstClassFields(application, dataServices, token)),
  }
}

export const getApplicationSubmissionData = async (
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<SubmitApprovedPremisesApplication> => {
  return {
    translatedDocument: application.document,
    ...(await getSubmitFirstClassFields(application, dataServices, token)),
  }
}

const firstClassFields = async <T>(
  application: Application,
  retrieveQuestionResponse: QuestionResponseFunction,
  dataServices: DataServices,
  token: string,
): Promise<FirstClassFields<T>> => {
  const noticeType = noticeTypeFromApplication(application)
  const apTypeResponse = retrieveQuestionResponse(application, SelectApType, 'type') as BackwardsCompatibleApplyApType
  const apType = apTypeResponse === 'standard' ? 'normal' : apTypeResponse
  const targetLocation = retrieveQuestionResponse(application, DescribeLocationFactors, 'postcodeArea')
  const sentenceType = getSentenceType(application, retrieveQuestionResponse)
  const releaseType = getReleaseType(application, sentenceType)
  const situation =
    releaseType === 'in_community' ? retrieveQuestionResponse(application, Situation, 'situation') : null
  const duration = placementDurationFromApplication(application)
  const arrival = arrivalDateFromApplication(application)
  const requestedPlacementPeriod: Cas1RequestedPlacementPeriod = arrival ? { arrival, duration } : undefined
  const isEmergencyApplication = noticeType === 'emergency'
  const apAreaId = retrieveQuestionResponse(application, ConfirmYourDetails, 'area')
  const { applicantUserDetails, caseManagerUserDetails, caseManagerIsNotApplicant } =
    applicantAndCaseManagerDetails(application)
  const { reasonForShortNotice, reasonForShortNoticeOther } = reasonForShortNoticeDetails(application)
  const licenseExpiryDate = licenceExpiryDateFromApplication(application)

  return {
    isWomensApplication: isWomensApplication(application),
    apType,
    targetLocation,
    releaseType,
    sentenceType,
    situation,
    duration,
    requestedPlacementPeriod,
    isEmergencyApplication,
    apAreaId,
    applicantUserDetails,
    caseManagerUserDetails,
    caseManagerIsNotApplicant,
    noticeType,
    reasonForShortNotice,
    reasonForShortNoticeOther,
    licenseExpiryDate,
  } as FirstClassFields<T>
}

const getUpdateFirstClassFields = async (
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<FirstClassFields<UpdateApprovedPremisesApplication>> => {
  return firstClassFields(application, retrieveOptionalQuestionResponseFromFormArtifact, dataServices, token)
}

const getSubmitFirstClassFields = async (
  application: Application,
  dataServices: DataServices,
  token: string,
): Promise<FirstClassFields<SubmitApprovedPremisesApplication>> => {
  return firstClassFields(application, retrieveQuestionResponseFromFormArtifact, dataServices, token)
}

const getReleaseType = (application: FormArtifact, sentenceType: SentenceTypeOption): ReleaseTypeOption =>
  substituteReleaseType(
    sentenceType,
    retrieveOptionalQuestionResponseFromFormArtifact(application, ReleaseType, 'releaseType'),
  )

const getSentenceType = (
  application: Application,
  retrieveQuestionResponse: QuestionResponseFunction,
): SentenceTypeOption => {
  return retrieveQuestionResponse(application, SentenceType, 'sentenceType') as SentenceTypeOption
}
