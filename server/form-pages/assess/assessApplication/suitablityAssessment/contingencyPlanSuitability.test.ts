import { assessmentFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue } from '../../../shared'

import ContingencyPlanSuitability, { ContingencyPlanSuitabilityBody } from './contingencyPlanSuitability'

import { suitabilityAssessmentAdjacentPage } from '../../../../utils/assessments/suitabilityAssessmentAdjacentPage'

jest.mock('../../../../utils/assessments/suitabilityAssessmentAdjacentPage')

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
    it('returns the result of suitabilityAssessmentAdjacentPage', () => {
      ;(suitabilityAssessmentAdjacentPage as jest.MockedFn<typeof suitabilityAssessmentAdjacentPage>).mockReturnValue(
        'application-timeliness',
      )
      expect(new ContingencyPlanSuitability(body, assessment).previous()).toEqual('application-timeliness')
    })
  })

  describe('errors', () => {
    it('should have an error if there are no answers', () => {
      const page = new ContingencyPlanSuitability({} as ContingencyPlanSuitabilityBody, assessment)

      expect(page.errors()).toEqual({
        contingencyPlanSufficient:
          'You must confirm if the contingency plan is sufficient to manage behaviour or a failure to return out of hours',
      })
    })

    it('should show an error if the answer is yes and there are no comments', () => {
      const page = new ContingencyPlanSuitability(
        { contingencyPlanSufficient: 'no' } as ContingencyPlanSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({
        additionalComments: 'You must provide additional comments',
      })
    })

    it('should not show an error if the answer is no and there are no additional comments', () => {
      const page = new ContingencyPlanSuitability(
        { contingencyPlanSufficient: 'yes' } as ContingencyPlanSuitabilityBody,
        assessment,
      )

      expect(page.errors()).toEqual({})
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
