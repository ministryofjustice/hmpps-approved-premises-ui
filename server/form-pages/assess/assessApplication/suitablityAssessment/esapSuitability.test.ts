import { assessmentFactory } from '../../../../testutils/factories'

import EsapSuitability, { EsapSuitabilityBody } from './esapSuitability'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('EsapSuitability', () => {
  const body: EsapSuitabilityBody = {
    esapPlacementNeccessary: 'yes',
    unsuitabilityForEsapRationale: 'some reasons',
    yesDetail: 'Some yes detail',
  }

  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new EsapSuitability(body, assessment).title).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new EsapSuitability(body, assessment)
      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    it('returns application-timeliness if the notice type is short_notice', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('short_notice')
      expect(new EsapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns application-timeliness if the notice type is emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(new EsapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns an empty string if the notice type is standard', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      expect(new EsapSuitability(body, assessment).next()).toEqual('')
    })
  })

  describe('previous', () => {
    it('returns rfap-suitability if the applicant requires an RFAP', () => {
      ;(retrieveOptionalQuestionResponseFromFormArtifact as jest.Mock).mockReturnValue('yes')

      expect(new EsapSuitability(body, assessment).previous()).toBe('rfap-suitability')
    })
  })

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new EsapSuitability({} as EsapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        esapPlacementNeccessary:
          'You must confirm if a Enhanced Security Approved Premises (ESAP) has been identified as a suitable placement',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the asnwer is yes', () => {
      const page = new EsapSuitability(body, assessment)

      expect(page.response()).toEqual({
        'Is an Enhanced Security Approved Premises (ESAP) placement necessary for the management of the individual referred?':
          'Yes - Some yes detail',
        'If the person is unsuitable for a ESAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })

    it('returns the response when the asnwer is no', () => {
      const page = new EsapSuitability(
        { ...body, esapPlacementNeccessary: 'no', noDetail: 'Some no detail' },
        assessment,
      )

      expect(page.response()).toEqual({
        'Is an Enhanced Security Approved Premises (ESAP) placement necessary for the management of the individual referred?':
          'No - Some no detail',
        'If the person is unsuitable for a ESAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })
  })
})
