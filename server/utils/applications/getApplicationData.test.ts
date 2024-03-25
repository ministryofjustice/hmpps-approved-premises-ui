import { ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'
import {
  RequiredQuestionResponses,
  mockOptionalQuestionResponse,
  mockQuestionResponse,
} from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('./arrivalDateFromApplication')
jest.mock('./utils')

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

  describe('getApplicationSubmissionData', () => {
    const releaseType: ReleaseTypeOption = 'licence'
    const sentenceType: SentenceTypeOption = 'standardDeterminate'
    const arrivalDate = '2023-01-01'

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      mockOptionalQuestionResponse({
        releaseType,
        sentenceType,
        applicantUserDetails,
        caseManagerUserDetails,
        caseManagerIsNotApplicant: false,
      })
    })

    it('returns the correct data', () => {
      mockRequiredQuestionResponses({ type: 'standard' })

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType,
        sentenceType,
        situation: null,
        targetLocation,
        arrivalDate,
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
        noticeType: 'emergency',
      })
    })

    it('returns the correct data for a pipe application', () => {
      mockRequiredQuestionResponses({ type: 'pipe' })

      expect(getApplicationSubmissionData(application).isPipeApplication).toEqual(true)
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
  })

  describe('getApplicationUpdateData', () => {
    it('returns empty attributes for a new application', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({})

      expect(getApplicationUpdateData(application)).toEqual({
        data: application.data,
        isInapplicable: false,
        isPipeApplication: undefined,
        isWomensApplication: false,
        releaseType: undefined,
        situation: null,
        sentenceType: undefined,
        targetLocation: undefined,
        arrivalDate: undefined,
        isEmergencyApplication: false,
        isEsapApplication: undefined,
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
        isInapplicable: false,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'license',
        sentenceType: 'standardDeterminate',
        situation: null,
        targetLocation,
        arrivalDate: '2023-01-01',
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
        noticeType: 'emergency',
      })
    })

    it('returns the correct data for a pipe application', () => {
      mockOptionalQuestionResponse({ type: 'pipe' })

      expect(getApplicationUpdateData(application).isPipeApplication).toEqual(true)
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
  })
})

const mockRequiredQuestionResponses = (customRequiredQuestionResponses: RequiredQuestionResponses) => {
  mockQuestionResponse({ ...defaultRequiredQuestionResponses, ...customRequiredQuestionResponses })
}
