import { applicationFactory } from '../../testutils/factories'
import {
  shouldShowContingencyPlanPartnersPages,
  shouldShowContingencyPlanQuestionsPage,
} from './shouldShowContingencyPlanPages'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('./noticeTypeFromApplication')

const application = applicationFactory.build()

describe('shouldShowContingencyPlanPartnersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  it('returns false if none of the conditions are met', () => {
    mockOptionalQuestionResponse({ sentenceType: 'ipp', type: 'other' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(false)
  })

  it('returns true if the application has a sentence type of "Community Order/SSO"', () => {
    mockOptionalQuestionResponse({ sentenceType: 'communityOrder' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a sentence type of "Non-statutory, MAPPA case"', () => {
    mockOptionalQuestionResponse({ sentenceType: 'nonStatutory' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a release type of "Post Sentence Supervision (PSS)"', () => {
    mockOptionalQuestionResponse({ sentenceType: 'ipp', releaseType: 'pss' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has an end date for "Post Sentence Supervision (PSS)"', () => {
    mockOptionalQuestionResponse({ pssDate: '20/02/2023' })

    expect(shouldShowContingencyPlanPartnersPages(application)).toEqual(true)
  })

  it('returns true if the application has a AP type of "ESAP"', () => {
    mockOptionalQuestionResponse({ type: 'esap' })

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
