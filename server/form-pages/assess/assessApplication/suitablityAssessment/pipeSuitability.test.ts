import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'

import PipeSuitability, { PipeSuitabilityBody } from './pipeSuitability'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')

describe('PipeSuitability', () => {
  const body: PipeSuitabilityBody = {
    pipeIdentifiedAsSuitable: 'yes',
    yesDetail: 'Some yes detail',
    unsuitabilityForPipeRationale: 'some reasons',
  }

  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new PipeSuitability(body, assessment).title).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new PipeSuitability(body, assessment)
      expect(page.body).toEqual(body)
    })
  })

  describe('next', () => {
    it('returns application-timeliness if the notice type is short_notice', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('short_notice')
      expect(new PipeSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns application-timeliness if the notice type is emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(new PipeSuitability(body, assessment).next()).toEqual('application-timeliness')
    })

    it('returns an empty string if the notice type is standard', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      expect(new PipeSuitability(body, assessment).next()).toEqual('')
    })
  })

  itShouldHavePreviousValue(new PipeSuitability(body, assessment), 'suitability-assessment')

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new PipeSuitability({} as PipeSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        pipeIdentifiedAsSuitable:
          'You must confirm if Psychologically Informed Planned Environment (PIPE) been identified as a viable pathway',
      })
    })

    it('should have an error if there is a yes answer but no details given', () => {
      const page = new PipeSuitability({ pipeIdentifiedAsSuitable: 'yes' } as PipeSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        yesDetail: 'You must provide details to support the decision',
      })
    })

    it('should have two errors if there is a no answer but no details given', () => {
      const page = new PipeSuitability({ pipeIdentifiedAsSuitable: 'no' } as PipeSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        noDetail: 'You must provide details to support the decision',
        unsuitabilityForPipeRationale:
          'You must summarise why the person is unsuitable for a PIPE placement yet suitable for a standard placement',
      })
    })
  })

  describe('response', () => {
    it('returns the response when the answer is "yes"', () => {
      const page = new PipeSuitability({ ...body, pipeIdentifiedAsSuitable: 'yes' }, assessment)

      expect(page.response()).toEqual({
        'Has Psychologically Informed Planned Environment (PIPE) been identified as a viable pathway?':
          'Yes - Some yes detail',
        'If the person is unsuitable for a PIPE placement yet suitable for a standard placement, summarise the rationale for the decision.':
          'some reasons',
      })
    })

    it('returns the response when the answer is "no"', () => {
      const page = new PipeSuitability(
        { ...body, pipeIdentifiedAsSuitable: 'no', noDetail: 'Some no detail' },
        assessment,
      )

      expect(page.response()).toEqual({
        'Has Psychologically Informed Planned Environment (PIPE) been identified as a viable pathway?':
          'No - Some no detail',
        'If the person is unsuitable for a PIPE placement yet suitable for a standard placement, summarise the rationale for the decision.':
          'some reasons',
      })
    })
  })
})
