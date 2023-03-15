import { ReleaseTypeOption } from '@approved-premises/api'
import applicationFactory from '../../testutils/factories/application'
import { applicationSubmissionData } from './applicationSubmissionData'
import mockQuestionResponse from '../../testutils/mockQuestionResponse'

jest.mock('../retrieveQuestionResponseFromApplicationOrAssessment')

describe('applicationSubmissionData', () => {
  const releaseType = 'license' as ReleaseTypeOption
  const targetLocation = 'ABC 123'

  it('returns the correct data for a pipe application', () => {
    mockQuestionResponse({ type: 'pipe', postcodeArea: targetLocation })

    const application = applicationFactory.withReleaseType(releaseType).build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: true,
      isWomensApplication: false,
      releaseType,
      targetLocation,
    })
  })

  it('returns the correct data for a non-pipe application', () => {
    mockQuestionResponse({ type: 'standard', postcodeArea: targetLocation })

    const application = applicationFactory.withReleaseType(releaseType).build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType,
      targetLocation,
    })
  })

  it('handles when a release type is missing', () => {
    mockQuestionResponse({ postcodeArea: targetLocation })

    const application = applicationFactory.build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType: undefined,
      targetLocation: 'ABC 123',
    })
  })

  it('returns in_community for a community order application', () => {
    mockQuestionResponse({ sentenceType: 'communityOrder', postcodeArea: targetLocation })

    const application = applicationFactory.build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType: 'in_community',
      targetLocation,
    })
  })

  it('returns in_community for a bail placement application', () => {
    mockQuestionResponse({ sentenceType: 'bailPlacement', postcodeArea: targetLocation })

    const application = applicationFactory.build()

    expect(applicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      isPipeApplication: false,
      isWomensApplication: false,
      releaseType: 'in_community',
      targetLocation,
    })
  })
})
