import { assessmentFactory } from '../../../../testutils/factories'

import RfapSuitability, { RfapSuitabilityBody } from './rfapSuitability'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage')

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
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(new RfapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })
  })

  describe('previous', () => {
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'suitability-assessment',
      )
      expect(new RfapSuitability(body, assessment).previous()).toEqual('suitability-assessment')
    })
  })

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new RfapSuitability({} as RfapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        rfapIdentifiedAsSuitable:
          'You must confirm if a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement',
      })
    })

    it('should show an error if the RFAP is identified as suitable but the corresponding comments box is not populated', () => {
      const page = new RfapSuitability(
        {
          rfapIdentifiedAsSuitable: 'yes',
        } as RfapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        yesDetail: 'You must provide details to support the decision',
      })
    })

    it('should show an error if the ESAP is identified as not suitable but the corresponding comments box and the rationale box are not populated', () => {
      const page = new RfapSuitability(
        {
          rfapIdentifiedAsSuitable: 'no',
        } as RfapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        noDetail: 'You must provide details to support the decision',
        unsuitabilityForRfapRationale: 'Provide a summary of the rationale',
      })
    })

    it('should show an error if the ESAP is identified as not suitable but the rationale box is not populated', () => {
      const page = new RfapSuitability(
        {
          rfapIdentifiedAsSuitable: 'no',
          noDetail: 'Some detail',
        } as RfapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        unsuitabilityForRfapRationale: 'Provide a summary of the rationale',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the answer is yes', () => {
      const page = new RfapSuitability(body, assessment)

      expect(page.response()).toEqual({
        'Has a Recovery Focused Approved Premises (RFAP) been identified as a suitable placement?':
          'Yes - Some yes detail',
        'If the person is unsuitable for a RFAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })

    it('returns the response when the answer is no', () => {
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
