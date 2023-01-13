import { YesOrNo } from '../../../../@types/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SuitabilityAssessment from './suitabilityAssessment'

describe('SuitabilityAssessment', () => {
  describe('title', () => {
    expect(
      new SuitabilityAssessment({
        riskFactors: 'yes',
        riskManagement: 'yes',
        locationOfPlacement: 'yes',
        moveOnPlan: 'yes',
      }).title,
    ).toBe('Suitability assessment')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SuitabilityAssessment({
        riskFactors: 'yes',
        riskManagement: 'yes',
        locationOfPlacement: 'yes',
        moveOnPlan: 'yes',
      })
      expect(page.body).toEqual({
        locationOfPlacement: 'yes',
        moveOnPlan: 'yes',
        riskFactors: 'yes',
        riskManagement: 'yes',
      })
    })
  })

  itShouldHaveNextValue(
    new SuitabilityAssessment({
      riskFactors: 'yes',
      riskManagement: 'yes',
      locationOfPlacement: 'yes',
      moveOnPlan: 'yes',
    }),
    '',
  )

  itShouldHavePreviousValue(
    new SuitabilityAssessment({
      riskFactors: 'yes',
      riskManagement: 'yes',
      locationOfPlacement: 'yes',
      moveOnPlan: 'yes',
    }),
    'dashboard',
  )

  describe('errors', () => {
    it('should have an error if there is no answers', () => {
      const page = new SuitabilityAssessment({
        riskFactors: '' as YesOrNo,
        riskManagement: '' as YesOrNo,
        locationOfPlacement: '' as YesOrNo,
        moveOnPlan: '' as YesOrNo,
      })

      expect(page.errors()).toEqual({
        locationOfPlacement: 'You must confirm if there factors to consider regarding the location of placement',
        moveOnPlan: 'You must confirm if the move on plan is sufficient',
        riskFactors: 'You must confirm if the application identifies the risk factors that an AP placement can support',
        riskManagement:
          'You must confirm if the application explains how an AP placement would be beneficial for risk management',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new SuitabilityAssessment({
        riskFactors: 'yes',
        riskFactorsComments: 'Some comments about risk factors',
        riskManagement: 'no',
        riskManagementComments: 'Risk management comments',
        locationOfPlacement: 'no',
        locationOfPlacementComments: 'Some comments about location of placement',
        moveOnPlan: 'yes',
        moveOnPlanComments: 'Move on plan comments',
      })

      expect(page.response()).toEqual({
        'Are there factors to consider regarding the location of placement?': 'No',
        'Are there factors to consider regarding the location of placement? Additional comments':
          'Some comments about location of placement',
        'Does the application explain how an AP placement would be beneficial for risk management?': 'No',
        'Does the application explain how an AP placement would be beneficial for risk management? Additional comments':
          'Risk management comments',
        'Does the application identify the risk factors that an Approved Premises (AP) placement can support?': 'Yes',
        'Does the application identify the risk factors that an Approved Premises (AP) placement can support? Additional comments':
          'Some comments about risk factors',
        'Is the move on plan sufficient?': 'Yes',
        'Is the move on plan sufficient? Additional comments': 'Move on plan comments',
      })
    })
  })
})
