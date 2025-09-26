import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import EnterTier from './enterRiskLevel'

describe('EnterRiskLevel', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new EnterTier({ riskLevel: 'highRisk' })

      expect(page.body).toEqual({
        riskLevel: 'highRisk',
      })
    })
  })

  itShouldHavePreviousValue(new EnterTier({}), '')

  describe('when risk level is high or very high', () => {
    it.each(['veryHighRisk', 'highRisk'] as const)('should return "is-exceptional-case"', riskLevel => {
      expect(new EnterTier({ riskLevel }).next()).toBe('is-exceptional-case')
    })
  })

  describe('when risk level is medium', () => {
    itShouldHaveNextValue(new EnterTier({ riskLevel: 'medium' }), 'not-eligible')
  })

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new EnterTier({ riskLevel: 'highRisk' })
      expect(page.errors()).toEqual({})
    })

    it('should return errors if riskLevel is blank', () => {
      const page = new EnterTier({})
      expect(page.errors()).toEqual({
        riskLevel: 'You must state the risk level',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EnterTier({ riskLevel: 'highRisk' })

      expect(page.response()).toEqual({
        "What is the person's risk level?": 'High risk',
      })
    })
  })
})
