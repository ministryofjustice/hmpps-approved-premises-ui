import { ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('./arrivalDateFromApplication')
jest.mock('./utils')

describe('getApplicationData', () => {
  const apAreaId = 'test-id'

  const applicantUserDetails = applicationUserDetailsFactory.build()
  const caseManagerUserDetails = applicationUserDetailsFactory.build()

  describe('getApplicationSubmissionData', () => {
    const releaseType: ReleaseTypeOption = 'licence'
    const sentenceType: SentenceTypeOption = 'standardDeterminate'
    const arrivalDate = '2023-01-01'
    const targetLocation = 'ABC 123'

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      mockOptionalQuestionResponse({
        releaseType,
        sentenceType,
        apAreaId,
        applicantUserDetails,
        caseManagerUserDetails,
        caseManagerIsNotApplicant: false,
      })
    })

    it('returns the correct data for a pipe application', () => {
      mockQuestionResponse({
        type: 'pipe',
        postcodeArea: targetLocation,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: true,
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
        caseManagerUserDetails: undefined,
        caseManagerIsNotApplicant: false,
      })
    })

    it('returns the correct data for a non-pipe application', () => {
      mockQuestionResponse({
        type: 'standard',
        postcodeArea: targetLocation,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

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
      })
    })

    it('handles when a release type is missing', () => {
      mockOptionalQuestionResponse({ releaseType: undefined, apAreaId, applicantUserDetails })
      mockQuestionResponse({
        postcodeArea: targetLocation,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: undefined,
        sentenceType,
        situation: null,
        targetLocation: 'ABC 123',
        arrivalDate,
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
      })
    })

    it('returns in_community for a community order application', () => {
      mockQuestionResponse({
        sentenceType: 'communityOrder',
        postcodeArea: targetLocation,
        situation: 'riskManagement',
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'in_community',
        sentenceType: 'communityOrder',
        situation: 'riskManagement',
        targetLocation,
        arrivalDate,
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
      })
    })

    it('returns in_community for a bail placement application', () => {
      mockQuestionResponse({
        sentenceType: 'bailPlacement',
        postcodeArea: targetLocation,
        situation: 'riskManagement',
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'in_community',
        sentenceType: 'bailPlacement',
        situation: 'riskManagement',
        targetLocation,
        arrivalDate,
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
      })
    })

    it('returns not_applicable for a non-statutory application', () => {
      mockQuestionResponse({
        sentenceType: 'nonStatutory',
        postcodeArea: targetLocation,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
      })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'not_applicable',
        sentenceType: 'nonStatutory',
        situation: null,
        targetLocation,
        arrivalDate,
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
      })
    })
  })

  describe('getApplicationUpdateData', () => {
    it('returns empty attributes for a new application', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({})

      const application = applicationFactory.build()

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
      })
    })

    it('returns all the defined attributes', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2023-01-01')
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({
        type: 'normal',
        releaseType: 'license',
        postcodeArea: 'ABC',
        sentenceType: 'standardDeterminate',
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
      })

      const application = applicationFactory.build()

      expect(getApplicationUpdateData(application)).toEqual({
        data: application.data,
        isInapplicable: false,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'license',
        sentenceType: 'standardDeterminate',
        situation: null,
        targetLocation: 'ABC',
        arrivalDate: '2023-01-01',
        isEmergencyApplication: true,
        isEsapApplication: false,
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
      })
    })

    it('returns the correct data for a pipe application', () => {
      mockOptionalQuestionResponse({ type: 'pipe' })

      const application = applicationFactory.build()

      const result = getApplicationUpdateData(application)

      expect(result.isPipeApplication).toEqual(true)
    })

    it('returns in_community for a community order application', () => {
      mockOptionalQuestionResponse({ sentenceType: 'communityOrder' })

      const application = applicationFactory.build()

      const result = getApplicationUpdateData(application)

      expect(result.releaseType).toEqual('in_community')
    })

    it('returns in_community for a bail placement application', () => {
      mockOptionalQuestionResponse({ sentenceType: 'bailPlacement' })

      const application = applicationFactory.build()

      const result = getApplicationUpdateData(application)

      expect(result.releaseType).toEqual('in_community')
    })

    it('returns the return value of `isInapplicable`', () => {
      ;(isInapplicable as jest.Mock).mockReturnValue(true)

      const application = applicationFactory.build()

      const result = getApplicationUpdateData(application)

      expect(result.isInapplicable).toEqual(true)
      expect(isInapplicable).toHaveBeenCalledWith(application)
    })
  })
})
