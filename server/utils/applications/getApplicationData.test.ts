import { ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'
import { when } from 'jest-when'
import { faker } from '@faker-js/faker/locale/en_GB'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'
import {
  RequiredQuestionResponses,
  mockOptionalQuestionResponse,
  mockQuestionResponse,
} from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'
import { isWomensApplication } from './isWomensApplication'
import { reasonForShortNoticeDetails } from './reasonForShortNoticeDetails'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'
import { DateFormats } from '../dateUtils'
import { licenceExpiryDateFromApplication } from './licenceExpiryDateFromApplication'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('./arrivalDateFromApplication')
jest.mock('./utils')
jest.mock('./isWomensApplication')
jest.mock('./reasonForShortNoticeDetails')
jest.mock('./licenceExpiryDateFromApplication')

const apAreaId = 'test-id'
const applicantUserDetails = applicationUserDetailsFactory.build()
const caseManagerIsNotApplicant = false
const postcodeArea = 'ABC 123'
const targetLocation = postcodeArea

const defaultRequiredQuestionResponses: RequiredQuestionResponses = {
  apAreaId,
  applicantUserDetails,
  caseManagerIsNotApplicant,
  postcodeArea,
}

const application = applicationFactory.build()

describe('getApplicationData', () => {
  const caseManagerUserDetails = applicationUserDetailsFactory.build()

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    when(reasonForShortNoticeDetails).calledWith(application).mockReturnValue({
      reasonForShortNotice: undefined,
      reasonForShortNoticeOther: undefined,
    })
  })

  describe('getApplicationSubmissionData', () => {
    const releaseType: ReleaseTypeOption = 'licence'
    const sentenceType: SentenceTypeOption = 'standardDeterminate'
    const arrivalDate = '2023-01-01'
    const licenceExpiryDate = DateFormats.dateObjToIsoDate(faker.date.soon())

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      ;(isWomensApplication as jest.Mock).mockReturnValue(false)
      ;(licenceExpiryDateFromApplication as jest.Mock).mockReturnValue(licenceExpiryDate)
      mockOptionalQuestionResponse({
        releaseType,
        sentenceType,
        applicantUserDetails,
        caseManagerUserDetails,
        caseManagerIsNotApplicant: false,
      })
    })

    it('returns the correct data', () => {
      mockRequiredQuestionResponses({ type: 'normal' })

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        apType: 'normal',
        isWomensApplication: false,
        licenseExpiryDate: licenceExpiryDate,
        releaseType,
        sentenceType,
        situation: null,
        targetLocation,
        arrivalDate,
        isEmergencyApplication: true,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
        noticeType: 'emergency',
      })
    })

    it('handles when a release type is missing', () => {
      mockOptionalQuestionResponse({ releaseType: undefined })
      mockRequiredQuestionResponses({})

      expect(getApplicationSubmissionData(application).releaseType).toEqual(undefined)
    })

    it('returns the correct data for a community order application', () => {
      mockRequiredQuestionResponses({ sentenceType: 'communityOrder', situation: 'riskManagement' })

      expect(getApplicationSubmissionData(application)).toEqual(
        expect.objectContaining({
          releaseType: 'in_community',
          sentenceType: 'communityOrder',
          situation: 'riskManagement',
        }),
      )
    })

    it('returns the correct data for a bail placement application', () => {
      mockRequiredQuestionResponses({ sentenceType: 'bailPlacement', situation: 'riskManagement' })

      expect(getApplicationSubmissionData(application)).toEqual(
        expect.objectContaining({
          releaseType: 'in_community',
          sentenceType: 'bailPlacement',
          situation: 'riskManagement',
        }),
      )
    })

    it('returns the correct data for a non-statutory application', () => {
      mockRequiredQuestionResponses({ sentenceType: 'nonStatutory' })

      expect(getApplicationSubmissionData(application)).toEqual(
        expect.objectContaining({
          releaseType: 'not_applicable',
          sentenceType: 'nonStatutory',
        }),
      )
    })

    it('returns the correct data for a reason for short notice application', () => {
      when(reasonForShortNoticeDetails).calledWith(application).mockReturnValue({
        reasonForShortNotice: 'other',
        reasonForShortNoticeOther: 'test',
      })
      expect(getApplicationSubmissionData(application)).toEqual(
        expect.objectContaining({
          reasonForShortNotice: 'other',
          reasonForShortNoticeOther: 'test',
        }),
      )
    })

    it('returns correct data for a womens application', () => {
      ;(isWomensApplication as jest.Mock).mockReturnValue(true)
      expect(getApplicationSubmissionData(application)).toEqual(expect.objectContaining({ isWomensApplication: true }))
    })

    it('returns the licence expiry date', () => {
      expect(getApplicationSubmissionData(application)).toEqual(
        expect.objectContaining({
          licenseExpiryDate: licenceExpiryDate,
        }),
      )
    })
  })

  describe('getApplicationUpdateData', () => {
    it('returns empty attributes for a new application', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      ;(isWomensApplication as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({})

      expect(getApplicationUpdateData(application)).toEqual({
        data: application.data,
        isInapplicable: false,
        apType: undefined,
        isWomensApplication: false,
        releaseType: undefined,
        situation: null,
        sentenceType: undefined,
        targetLocation: undefined,
        arrivalDate: undefined,
        isEmergencyApplication: false,
        apAreaId: undefined,
        caseManagerIsNotApplicant: undefined,
        applicantUserDetails: undefined,
        caseManagerUserDetails: undefined,
        noticeType: 'standard',
      })
    })

    it('returns all the defined attributes', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2023-01-01')
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      ;(isWomensApplication as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({
        type: 'normal',
        releaseType: 'license',
        postcodeArea,
        sentenceType: 'standardDeterminate',
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
      })

      expect(getApplicationUpdateData(application)).toEqual({
        data: application.data,
        apType: 'normal',
        isInapplicable: false,
        isWomensApplication: false,
        releaseType: 'license',
        sentenceType: 'standardDeterminate',
        situation: null,
        targetLocation,
        arrivalDate: '2023-01-01',
        isEmergencyApplication: true,
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
        noticeType: 'emergency',
      })
    })

    it('returns the correct data for a community order application', () => {
      mockOptionalQuestionResponse({ sentenceType: 'communityOrder' })

      expect(getApplicationUpdateData(application).releaseType).toEqual('in_community')
    })

    it('returns the correct data for a bail placement application', () => {
      mockOptionalQuestionResponse({ sentenceType: 'bailPlacement' })

      expect(getApplicationUpdateData(application).releaseType).toEqual('in_community')
    })

    it('returns the return value of `isInapplicable`', () => {
      ;(isInapplicable as jest.Mock).mockReturnValue(true)
      mockOptionalQuestionResponse({})

      expect(getApplicationUpdateData(application).isInapplicable).toEqual(true)
      expect(isInapplicable).toHaveBeenCalledWith(application)
    })

    it('returns the correct data for a reason for short notice application', () => {
      mockOptionalQuestionResponse({})
      when(reasonForShortNoticeDetails).calledWith(application).mockReturnValue({
        reasonForShortNotice: 'other',
        reasonForShortNoticeOther: 'test',
      })
      expect(getApplicationUpdateData(application)).toEqual(
        expect.objectContaining({
          reasonForShortNotice: 'other',
          reasonForShortNoticeOther: 'test',
        }),
      )
    })
  })
})

const mockRequiredQuestionResponses = (customRequiredQuestionResponses: RequiredQuestionResponses) => {
  mockQuestionResponse({ ...defaultRequiredQuestionResponses, ...customRequiredQuestionResponses })
}
