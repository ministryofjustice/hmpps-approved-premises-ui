import { applicationFactory } from '../../testutils/factories'
import { shouldShowContingencyPlanPages } from './shouldShowContingencyPlanPages'
import mockQuestionResponse from '../../testutils/mockQuestionResponse'

jest.mock('../retrieveQuestionResponseFromApplicationOrAssessment')

describe('shouldShowContingencyPlanPages', () => {
  const application = applicationFactory.build()

  it('returns false if none of the conditions are met', () => {
    mockQuestionResponse({ sentenceType: 'ipp', type: 'other' })
    expect(shouldShowContingencyPlanPages(application)).toEqual(false)
  })

  it('returns true if the application has a sentence type of "Community Order/SSO"', () => {
    mockQuestionResponse({ sentenceType: 'communityOrder' })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns true if the application has a sentence type of "Non-statutory, MAPPA case"', () => {
    mockQuestionResponse({ sentenceType: 'nonStatutory' })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns true if the application has a release type of "Post Sentence Supervision (PSS)"', () => {
    mockQuestionResponse({ sentenceType: 'ipp', releaseType: 'pss' })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns false if the application has a AP type of "ESAP"', () => {
    mockQuestionResponse({ type: 'esap' })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })
})
