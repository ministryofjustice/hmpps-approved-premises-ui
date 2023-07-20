import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import RfapSuitability, { RfapSuitabilityBody } from './rfapSuitability'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')

describe('RfapSuitability', () => {
  const body: RfapSuitabilityBody = {
    rfapIdentifiedAsSuitable: 'yes',
    unsuitabilityForRfapRationale: 'some reasons',
    yesDetail: 'Some yes detail',
  }

  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new RfapSuitability(body, assessment).title).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new RfapSuitability(body, assessment)
      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    it('returns application-timeliness if the notice type is short_notice', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('short_notice')
      expect(new RfapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns application-timeliness if the notice type is emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(new RfapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns an empty string if the notice type is standard', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      expect(new RfapSuitability(body, assessment).next()).toEqual('')
    })
  })

  itShouldHavePreviousValue(new RfapSuitability(body, assessment), 'suitability-assessment')

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new RfapSuitability({} as RfapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        rfapIdentifiedAsSuitable:
          'You must confirm if a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the asnwer is yes', () => {
      const page = new RfapSuitability(body, assessment)

      expect(page.response()).toEqual({
        'Has a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement?':
          'Yes - Some yes detail',
        'If the person is unsuitable for a RFAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })

    it('returns the response when the asnwer is no', () => {
      const page = new RfapSuitability(
        { ...body, rfapIdentifiedAsSuitable: 'no', noDetail: 'Some no detail' },
        assessment,
      )

      expect(page.response()).toEqual({
        'Has a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement?':
          'No - Some no detail',
        'If the person is unsuitable for a RFAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })
  })
})
