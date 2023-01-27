import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MakeADecision from './makeADecision'

describe('MakeADecision', () => {
  describe('title', () => {
    expect(
      new MakeADecision({
        decision: 'accommodationNeedOnly',
      }).title,
    ).toBe('Make a decision')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new MakeADecision({
        decision: 'accommodationNeedOnly',
      })
      expect(page.body).toEqual({
        decision: 'accommodationNeedOnly',
      })
    })
  })

  itShouldHaveNextValue(
    new MakeADecision({
      decision: 'accommodationNeedOnly',
    }),
    '',
  )

  itShouldHavePreviousValue(
    new MakeADecision({
      decision: 'accommodationNeedOnly',
    }),
    'dashboard',
  )

  describe('errors', () => {
    it('should have an error if there is no answers', () => {
      const page = new MakeADecision({} as { decision: string })

      expect(page.errors()).toEqual({
        decision: 'You must select one option',
      })
    })
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MakeADecision({
        decision: 'riskTooHigh',
      })

      expect(page.response()).toEqual({
        Decision:
          'Requested information not provided by probation practitioner: Reject, risk too high (must be approved by an AP Area Manager (APAM)',
      })
    })
  })
})
