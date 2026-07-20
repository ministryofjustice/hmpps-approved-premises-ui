import { Cas1RequestedPlacementPeriod, ReleaseTypeOption, SentenceTypeOption } from '@approved-premises/api'
import { when } from 'jest-when'
import { faker } from '@faker-js/faker/locale/en_GB'
import { createMock } from '@golevelup/ts-jest'
import { DataServices } from '@approved-premises/ui'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'
import {
  RequiredQuestionResponses,
  mockOptionalQuestionResponse,
  mockQuestionResponse,
} from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { placementDurationFromApplication } from './placementDurationFromApplication'
import { isInapplicable } from './utils'
import { isWomensApplication } from './isWomensApplication'
import { reasonForShortNoticeDetails } from './reasonForShortNoticeDetails'
import { applicationUserDetailsFactory } from '../../testutils/factories/application'
import { DateFormats } from '../dateUtils'
import { licenceExpiryDateFromApplication } from './licenceExpiryDateFromApplication'
import { ApplicationService } from '../../services'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
jest.mock('./arrivalDateFromApplication')
jest.mock('./placementDurationFromApplication')
jest.mock('./utils')
jest.mock('./isWomensApplication')
jest.mock('./reasonForShortNoticeDetails')
jest.mock('./licenceExpiryDateFromApplication')

const applicationService = createMock<ApplicationService>({})
const dataServices: DataServices = { applicationService }
const token = 'test_token'

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
    const requestedPlacementPeriod: Cas1RequestedPlacementPeriod = {
      arrival: '2023-01-01',
      duration: 84,
    }
    const licenceExpiryDate = DateFormats.dateObjToIsoDate(faker.date.soon())

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(requestedPlacementPeriod.arrival)
      ;(placementDurationFromApplication as jest.Mock).mockReturnValue(requestedPlacementPeriod.duration)
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

    it('returns the correct data', async () => {
      mockRequiredQuestionResponses({ type: 'normal' })

      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual({
        translatedDocument: application.document,
        apType: 'normal',
        isWomensApplication: false,
        licenseExpiryDate: licenceExpiryDate,
        releaseType,
        sentenceType,
        situation: null,
        targetLocation,
        duration: 84,
        requestedPlacementPeriod,
        isEmergencyApplication: true,
        apAreaId,
        applicantUserDetails,
        caseManagerIsNotApplicant: false,
        caseManagerUserDetails: undefined,
        noticeType: 'emergency',
      })
    })

    it('handles when a release type is missing', async () => {
      mockOptionalQuestionResponse({ releaseType: undefined })
      mockRequiredQuestionResponses({})

      expect((await getApplicationSubmissionData(application, dataServices, token)).releaseType).toEqual(undefined)
    })

    it('returns the correct data for a community order application', async () => {
      mockRequiredQuestionResponses({ sentenceType: 'communityOrder', situation: 'riskManagement' })

      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({
          releaseType: 'in_community',
          sentenceType: 'communityOrder',
          situation: 'riskManagement',
        }),
      )
    })

    it('returns the correct data for a bail placement application', async () => {
      mockRequiredQuestionResponses({ sentenceType: 'bailPlacement', situation: 'riskManagement' })

      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({
          releaseType: 'in_community',
          sentenceType: 'bailPlacement',
          situation: 'riskManagement',
        }),
      )
    })

    it('returns the correct data for a non-statutory application', async () => {
      mockRequiredQuestionResponses({ sentenceType: 'nonStatutory' })

      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({
          releaseType: 'not_applicable',
          sentenceType: 'nonStatutory',
        }),
      )
    })

    it('returns the correct data for a reason for short notice application', async () => {
      when(reasonForShortNoticeDetails).calledWith(application).mockReturnValue({
        reasonForShortNotice: 'other',
        reasonForShortNoticeOther: 'test',
      })
      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({
          reasonForShortNotice: 'other',
          reasonForShortNoticeOther: 'test',
        }),
      )
    })

    it('returns correct data for a womens application', async () => {
      ;(isWomensApplication as jest.Mock).mockReturnValue(true)
      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({ isWomensApplication: true }),
      )
    })

    it('returns the licence expiry date', async () => {
      expect(await getApplicationSubmissionData(application, dataServices, token)).toEqual(
        expect.objectContaining({
          licenseExpiryDate: licenceExpiryDate,
        }),
      )
    })
  })

  describe('getApplicationUpdateData', () => {
    it('returns empty attributes for a new application', async () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(undefined)
      ;(placementDurationFromApplication as jest.Mock).mockReturnValue(undefined)
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      ;(isWomensApplication as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({})

      expect(await getApplicationUpdateData(application, dataServices, token)).toEqual({
        data: application.data,
        document: application.document,
        isInapplicable: false,
        apType: undefined,
        isWomensApplication: false,
        releaseType: undefined,
        situation: null,
        sentenceType: undefined,
        targetLocation: undefined,
        arrivalDate: undefined,
        duration: undefined,
        isEmergencyApplication: false,
        apAreaId: undefined,
        caseManagerIsNotApplicant: undefined,
        applicantUserDetails: undefined,
        caseManagerUserDetails: undefined,
        noticeType: 'standard',
      })
    })

    it('returns all the defined attributes', async () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2023-01-01')
      ;(placementDurationFromApplication as jest.Mock).mockReturnValue(56)
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

      expect(await getApplicationUpdateData(application, dataServices, token)).toEqual({
        data: application.data,
        document: application.document,
        apType: 'normal',
        isInapplicable: false,
        isWomensApplication: false,
        releaseType: 'license',
        sentenceType: 'standardDeterminate',
        situation: null,
        targetLocation,
        duration: 56,
        requestedPlacementPeriod: { arrival: '2023-01-01', duration: 56 },
        isEmergencyApplication: true,
        apAreaId,
        caseManagerIsNotApplicant: true,
        applicantUserDetails,
        caseManagerUserDetails,
        noticeType: 'emergency',
      })
    })

    it('returns the correct data for a community order application', async () => {
      mockOptionalQuestionResponse({ sentenceType: 'communityOrder' })

      expect((await getApplicationUpdateData(application, dataServices, token)).releaseType).toEqual('in_community')
    })

    it('returns the correct data for a bail placement application', async () => {
      mockOptionalQuestionResponse({ sentenceType: 'bailPlacement' })

      expect((await getApplicationUpdateData(application, dataServices, token)).releaseType).toEqual('in_community')
    })

    it('returns the return value of `isInapplicable`', async () => {
      ;(isInapplicable as jest.Mock).mockReturnValue(true)
      mockOptionalQuestionResponse({})

      expect((await getApplicationUpdateData(application, dataServices, token)).isInapplicable).toEqual(true)
      expect(isInapplicable).toHaveBeenCalledWith(application)
    })

    it('returns the correct data for a reason for short notice application', async () => {
      mockOptionalQuestionResponse({})
      when(reasonForShortNoticeDetails).calledWith(application).mockReturnValue({
        reasonForShortNotice: 'other',
        reasonForShortNoticeOther: 'test',
      })
      expect(await getApplicationUpdateData(application, dataServices, token)).toEqual(
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
