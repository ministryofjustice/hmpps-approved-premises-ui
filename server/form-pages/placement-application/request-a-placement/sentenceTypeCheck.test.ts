import { DataServices, YesOrNo } from '@approved-premises/ui'
import { itShouldHavePreviousValue } from '../../shared/index'

import SentenceTypeCheck, { Body } from './sentenceTypeCheck'
import { applicationFactory, placementApplicationFactory } from '../../../testutils/factories'
import { ApplicationService } from '../../../services'

describe('SentenceTypeCheck', () => {
  const application = applicationFactory.build()
  const placementApplication = placementApplicationFactory.build({ applicationId: application.id })
  const findApplication = jest.fn(() => application)
  const applicationService = { findApplication } as unknown as ApplicationService
  const dataServices: Partial<DataServices> = { applicationService }
  const token = 'test-token'

  describe('title', () => {
    expect(new SentenceTypeCheck({}, placementApplication).title).toBe('Check the sentencing information')
  })

  itShouldHavePreviousValue(new SentenceTypeCheck({}, placementApplication), '')

  describe('next', () => {
    it.each([
      ['sentence type incorrect', 'sentence-type', { sentenceTypeCheck: 'yes' as YesOrNo }],
      [
        'sentence type correct and release type ROTL',
        'previous-rotl-placement',
        { sentenceTypeCheck: 'no' as YesOrNo, applicationReleaseType: 'rotl' },
      ],
      [
        'sentence type correct and release type Parole (directed)',
        'decision-to-release',
        { sentenceTypeCheck: 'no' as YesOrNo, applicationReleaseType: 'paroleDirectedLicence' },
      ],
      [
        'sentence type correct and any other release type',
        'additional-placement-details',
        { sentenceTypeCheck: 'no' as YesOrNo, applicationReleaseType: 'anything-else' },
      ],
    ])('if %s, should navigate to %s', (_, expected, params) => {
      const page = new SentenceTypeCheck(params as Body, placementApplication)
      expect(page.next()).toEqual(expected)
    })
  })

  describe('response', () => {
    it('should return the response', () => {
      const page = new SentenceTypeCheck(
        { sentenceTypeCheck: 'no' as YesOrNo, applicationSentenceType: 'ipp', applicationReleaseType: 'rotl' },
        placementApplication,
      )

      expect(page.response()).toEqual({
        [page.question]: 'No',
        'Application sentence type': 'Indeterminate Public Protection (IPP)',
        'Application release type': 'Release on Temporary Licence (ROTL)',
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object if the sentence type check is populated', () => {
      const page = new SentenceTypeCheck({ sentenceTypeCheck: 'no' }, placementApplication)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if the release type is not populated', () => {
      const page = new SentenceTypeCheck({}, placementApplication)
      expect(page.errors()).toEqual({ sentenceTypeCheck: 'You must say if the sentence information is correct' })
    })
  })

  describe('initialize', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should retrieve the application and populate the sentence and release types', async () => {
      const page = await SentenceTypeCheck.initialize({}, placementApplication, token, dataServices)
      expect(findApplication).toHaveBeenCalledWith(token, application.id)
      expect(page.applicationReleaseType).toEqual(application.releaseType)
      expect(page.applicationSentenceType).toEqual(application.sentenceType)
    })

    it('should not retrieve the application if sentence and release types are already in body', async () => {
      const page = await SentenceTypeCheck.initialize(
        { applicationSentenceType: 'life', applicationReleaseType: 'paroleDirectedLicence' },
        placementApplication,
        token,
        dataServices,
      )
      expect(findApplication).not.toHaveBeenCalled()
      expect(page.applicationReleaseType).toEqual('paroleDirectedLicence')
      expect(page.applicationSentenceType).toEqual('life')
    })
  })

  describe('summaryRows', () => {
    it('should return the correct summary rows from the application', async () => {
      const page = await SentenceTypeCheck.initialize(
        { applicationSentenceType: 'life', applicationReleaseType: 'paroleDirectedLicence' },
        placementApplication,
        token,
        dataServices,
      )
      expect(page.summaryRows).toEqual([
        { key: { text: 'Sentence type' }, value: { text: 'Life sentence' } },
        { key: { text: 'Release type' }, value: { text: 'Licence (Parole directed)' } },
      ])
    })
  })
})
