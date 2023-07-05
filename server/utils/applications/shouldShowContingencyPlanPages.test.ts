import { applicationFactory } from '../../testutils/factories'
import { shouldShowContingencyPlanPartnersPages } from './shouldShowContingencyPlanPages'
import { mockOptionalQuestionResponse, mockQuestionResponse } from '../../testutils/mockQuestionResponse'

jest.mock('../retrieveQuestionResponseFromFormArtifact')

  const application = applicationFactory.build()

describe('shouldShowContingencyPlanPartnersPage', () => {
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
  })
})
