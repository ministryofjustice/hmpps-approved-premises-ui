import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue } from '../../../shared-examples'

import ContingencyPlanSuitability, { ContingencyPlanSuitabilityBody } from './contingencyPlanSuitability'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'

jest.mock('../../../../utils/applications/noticeTypeFromApplication')

describe('ContingencyPlanSuitability', () => {
  const body: ContingencyPlanSuitabilityBody = {
    contingencyPlanSufficient: 'yes',
    additionalComments: 'some comments',
  }

  const assessment = assessmentFactory.build()
  describe('title', () => {
    expect(new ContingencyPlanSuitability(body, assessment).title).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ContingencyPlanSuitability(body, assessment)
      expect(page.body).toEqual({
        contingencyPlanSufficient: 'yes',
        additionalComments: 'some comments',
      })
    })
  })

  itShouldHaveNextValue(new ContingencyPlanSuitability(body, assessment), '')

  describe('previous', () => {
    it('returns application-timeliness if the notice type is emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('emergency')
      expect(new ContingencyPlanSuitability(body, assessment).previous()).toBe('application-timeliness')
    })

    it('returns application-timeliness if the notice type is emergency', () => {
      ;(noticeTypeFromApplication as jest.Mock).mockReturnValue('standard')
      expect(new ContingencyPlanSuitability(body, assessment).previous()).toBe('suitability-assessment')
    })
  })
  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new ContingencyPlanSuitability({} as ContingencyPlanSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        additionalComments: 'You must provide additional comments',
        contingencyPlanSufficient:
          'You must confirm if the contingency plan is sufficient to manage behaviour or a failure to return out of hours',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new ContingencyPlanSuitability(body, assessment)

      expect(page.response()).toEqual({
        'Is the contingency plan sufficient to manage behaviour or a failure to return out of hours?': 'Yes',
        'Is the contingency plan sufficient to manage behaviour or a failure to return out of hours? Additional comments':
          'some comments',
      })
    })
  })
})
