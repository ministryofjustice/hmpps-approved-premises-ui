import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { addResponseToApplication } from '../../testutils/addToApplication'
import applicationFactory from '../../testutils/factories/application'
import { shouldShowContingencyPlanPages } from './shouldShowContingencyPlanPages'

describe('shouldShowContingencyPlanPages', () => {
  let defaultApplication: Application
  beforeEach(() => {
    defaultApplication = applicationFactory
      .withPageResponse({
        task: 'basic-information',
        page: 'sentence-type',
        key: 'sentenceType',
        value: 'ipp',
      })
      .withPageResponse({
        task: 'basic-information',
        page: 'release-type',
        key: 'releaseType',
        value: 'other',
      })
      .withPageResponse({
        task: 'type-of-ap',
        page: 'ap-type',
        key: 'apType',
        value: 'other',
      })
      .build()
  })

  it('returns an empty string if none of the conditions are met', () => {
    expect(shouldShowContingencyPlanPages(defaultApplication)).toEqual(false)
  })

  it('returns "contingency-plan-partners" if the application has a sentence type of "Community Order/SSO"', () => {
    const application = addResponseToApplication(defaultApplication, {
      section: 'basic-information',
      page: 'sentence-type',
      key: 'sentenceType',
      value: 'communityOrder',
    })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns "contingency-plan-partners" if the application has a sentence type of "Non-statutory, MAPPA case"', () => {
    const application = addResponseToApplication(defaultApplication, {
      section: 'basic-information',
      page: 'sentence-type',
      key: 'sentenceType',
      value: 'nonStatutory',
    })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns "contingency-plan-partners" if the application has a release type of "Post Sentence Supervision (PSS)"', () => {
    const application = addResponseToApplication(defaultApplication, {
      section: 'basic-information',
      page: 'release-type',
      key: 'releaseType',
      value: 'pss',
    })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })

  it('returns "contingency-plan-partners" if the application has a AP type of "ESAP"', () => {
    const application = addResponseToApplication(defaultApplication, {
      section: 'type-of-ap',
      page: 'ap-type',
      key: 'apType',
      value: 'esap',
    })

    expect(shouldShowContingencyPlanPages(application)).toEqual(true)
  })
})
