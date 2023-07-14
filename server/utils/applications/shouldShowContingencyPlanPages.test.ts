import { applicationFactory } from '../../testutils/factories'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from './shouldShowContingencyPlanPages'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./arrivalDateFromApplication')
jest.mock('./noticeTypeFromApplication')

const application = applicationFactory.build()

describe('shouldShowContingencyPlanPartnersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  it('returns false if none of the conditions are met', () => {
    mockQuestionResponse({ sentenceType: 'ipp', type: 'other' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(false)
  })

  it('returns true if the application has a sentence type of "Community Order/SSO"', () => {
    mockQuestionResponse({ sentenceType: 'communityOrder' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a sentence type of "Non-statutory, MAPPA case"', () => {
    mockQuestionResponse({ sentenceType: 'nonStatutory' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a release type of "Post Sentence Supervision (PSS)"', () => {
    mockQuestionResponse({ sentenceType: 'ipp', releaseType: 'pss' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has an end date for "Post Sentence Supervision (PSS)"', () => {
    mockOptionalQuestionResponse({ pssDate: '20/02/2023' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a AP type of "ESAP"', () => {
    mockQuestionResponse({ type: 'esap' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })
})

describe('shouldShowContingencyPlanQuestionsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns true if the application notice type is emergency"', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')

    expect(shouldShowContingencyPlanQuestionsPage(application)).toEqual(true)
  })

  it('returns false if the application notice type is standard"', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')

    expect(shouldShowContingencyPlanQuestionsPage(application)).toEqual(false)
  })

  it('returns false if the application notice type is standard"', () => {
    ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('short_notice')

    expect(shouldShowContingencyPlanQuestionsPage(application)).toEqual(false)
  })
})
