import { ReleaseTypeOption } from '@approved-premises/api'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { isInapplicable } from './utils'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./arrivalDateFromApplication')
jest.mock('./utils')

describe('getApplicationData', () => {
  describe('getApplicationSubmissionData', () => {
    const releaseType = 'license' as ReleaseTypeOption
    const arrivalDate = '2023-01-01'
    const targetLocation = 'ABC 123'

    beforeEach(() => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue(arrivalDate)
      mockOptionalQuestionResponse({ releaseType })
    })

    it('returns the correct data for a pipe application', () => {
      mockQuestionResponse({ type: 'pipe', postcodeArea: targetLocation })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: true,
        isWomensApplication: false,
        releaseType,
        targetLocation,
        arrivalDate,
      })
    })

    it('returns the correct data for a non-pipe application', () => {
      mockQuestionResponse({ type: 'standard', postcodeArea: targetLocation })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType,
        targetLocation,
        arrivalDate,
      })
    })

    it('handles when a release type is missing', () => {
      mockOptionalQuestionResponse({ releaseType: undefined })
      mockQuestionResponse({ postcodeArea: targetLocation })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: undefined,
        targetLocation: 'ABC 123',
        arrivalDate,
      })
    })

    it('returns in_community for a community order application', () => {
      mockQuestionResponse({ sentenceType: 'communityOrder', postcodeArea: targetLocation })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'in_community',
        targetLocation,
        arrivalDate,
      })
    })

    it('returns in_community for a bail placement application', () => {
      mockQuestionResponse({ sentenceType: 'bailPlacement', postcodeArea: targetLocation })

      const application = applicationFactory.build()

      expect(getApplicationSubmissionData(application)).toEqual({
        translatedDocument: application.document,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'in_community',
        targetLocation,
        arrivalDate,
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
        targetLocation: undefined,
        arrivalDate: undefined,
      })
    })

    it('returns all the defined attributes', () => {
      ;(arrivalDateFromApplication as jest.Mock).mockReturnValue('2023-01-01')
      ;(isInapplicable as jest.Mock).mockReturnValue(false)
      mockOptionalQuestionResponse({ type: 'normal', releaseType: 'license', postcodeArea: 'ABC' })

      const application = applicationFactory.build()

      expect(getApplicationUpdateData(application)).toEqual({
        data: application.data,
        isInapplicable: false,
        isPipeApplication: false,
        isWomensApplication: false,
        releaseType: 'license',
        targetLocation: 'ABC',
        arrivalDate: '2023-01-01',
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
