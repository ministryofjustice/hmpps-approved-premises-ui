import { assessmentFactory } from '../../../../testutils/factories'

import MhapSuitability, { MhapSuitabilityBody } from './mhapSuitability'

import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage')
jest.mock('../../../../utils/retrieveQuestionResponseFromFormArtifact')

describe('MhapSuitability', () => {
  const body: MhapSuitabilityBody = {
    mhapIdentifiedAsSuitable: 'yes',
    yesDetail: 'Some yes detail',
    unsuitabilityForMhapRationale: 'some reasons',
  }

  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new MhapSuitability(body, assessment).title).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new MhapSuitability(body, assessment)
      expect(page.body).toEqual(body)
    })
  })

  describe('previous', () => {
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'suitability-assessment',
      )
      expect(new MhapSuitability(body, assessment).previous()).toEqual('suitability-assessment')
    })
  })

  describe('next', () => {
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(new MhapSuitability(body, assessment).next()).toEqual('application-timeliness')
    })
  })

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new MhapSuitability({} as MhapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        mhapIdentifiedAsSuitable:
          'You must confirm if a Specialist Mental Health Approved Premises (MHAP) been identified as a suitable placement',
      })
    })

    it('should have an error if there is a yes answer but no details given', () => {
      const page = new MhapSuitability({ mhapIdentifiedAsSuitable: 'yes' } as MhapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        yesDetail: 'You must provide details to support the decision',
      })
    })

    it('should have two errors if there is a no answer but no details given', () => {
      const page = new MhapSuitability({ mhapIdentifiedAsSuitable: 'no' } as MhapSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        noDetail: 'You must provide details to support the decision',
        unsuitabilityForMhapRationale:
          'You must summarise why the person is unsuitable for an MHAP placement yet suitable for a standard placement',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the answer is "yes"', () => {
      const page = new MhapSuitability({ ...body, mhapIdentifiedAsSuitable: 'yes' }, assessment)

      expect(page.response()).toEqual({
        'Has a Specialist Mental Health Approved Premises (MHAP) been identified as a suitable placement?':
          'Yes - Some yes detail',
        'If the person is unsuitable for an MHAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })

    it('returns the response when the answer is "no"', () => {
      const page = new MhapSuitability(
        { ...body, mhapIdentifiedAsSuitable: 'no', noDetail: 'Some no detail' },
        assessment,
      )

      expect(page.response()).toEqual({
        'Has a Specialist Mental Health Approved Premises (MHAP) been identified as a suitable placement?':
          'No - Some no detail',
        'If the person is unsuitable for an MHAP placement yet suitable for a standard placement, summarise the rationale for the decision':
          'some reasons',
      })
    })
  })
})
