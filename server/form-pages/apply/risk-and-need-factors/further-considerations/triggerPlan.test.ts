import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import TriggerPlan, { TriggerPlanBody } from './triggerPlan'

describe('TriggerPlan', () => {
  const body = {
    planInPlace: 'yes' as const,
    additionalConditions: 'yes' as const,
    additionalConditionsDetail: 'some details',
  }
  describe('title', () => {
    it('should set the title', () => {
      const page = new TriggerPlan(body)

      expect(page.title).toEqual('Contingency plans')
    })
  })

  describe('body', () => {
    const page = new TriggerPlan(body)

    expect(page.body).toEqual(body)
  })

  itShouldHaveNextValue(new TriggerPlan(body), '')

  itShouldHavePreviousValue(new TriggerPlan(body), 'contingency-plan-questions')

  describe('errors', () => {
    describe('if there are no responses', () => {
      const page = new TriggerPlan({} as TriggerPlanBody)

      expect(page.errors()).toEqual({
        additionalConditions:
          'You must confirm if additional Licence conditions have been requested as an alternative to recall',
        planInPlace: 'You must confirm if there is a trigger plan in place',
      })
    })
    describe('if the responses to "additionalConditions" is "yes" but no details are given', () => {
      const page = new TriggerPlan({ planInPlace: 'yes', additionalConditions: 'yes' } as TriggerPlanBody)

      expect(page.errors()).toEqual({
        additionalConditionsDetail:
          'You must detail additional Licence conditions have been requested as an alternative to recall',
      })
    })
  })

  describe('response', () => {
    it('should return the responses to the question in plain english', () => {
      const page = new TriggerPlan(body)

      expect(page.response()).toEqual({
        'Is there a trigger plan in place?': 'Yes',
        'Have additional Licence conditions been requested as an alternative to recall?': 'Yes - some details',
      })
    })
  })
})
