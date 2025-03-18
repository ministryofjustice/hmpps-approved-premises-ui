import { assessmentFactory } from '../../../../testutils/factories'

import EsapSuitability, { EsapSuitabilityBody } from './esapSuitability'
import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage')
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
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(new EsapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })
  })

  describe('previous', () => {
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'suitability-assessment',
      )
      expect(new EsapSuitability(body, assessment).previous()).toEqual('suitability-assessment')
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

    it('should show an error if the ESAP is identified as suitable but the corresponding comments box is not populated', () => {
      const page = new EsapSuitability(
        {
          esapPlacementNeccessary: 'yes',
        } as EsapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        yesDetail: 'You must provide details to support the decision',
      })
    })

    it('should show two errors if the ESAP is identified as not suitable but the corresponding comments box and the rationale box are not populated', () => {
      const page = new EsapSuitability(
        {
          esapPlacementNeccessary: 'no',
        } as EsapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        noDetail: 'You must provide details to support the decision',
        unsuitabilityForEsapRationale: 'Provide a summary of the rationale',
      })
    })

    it('should show an error if the ESAP is identified as not suitable but the rationale box is not populated', () => {
      const page = new EsapSuitability(
        {
          esapPlacementNeccessary: 'no',
          noDetail: 'some detail',
        } as EsapSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        unsuitabilityForEsapRationale: 'Provide a summary of the rationale',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the answer is yes', () => {
      const page = new EsapSuitability(body, assessment)

      expect(page.response()).toEqual({
        'Is an Enhanced Security Approved Premises (ESAP) placement necessary for the management of the individual referred?':
          'Yes - Some yes detail',
        'If the person is unsuitable for a ESAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })

    it('returns the response when the answer is no', () => {
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
