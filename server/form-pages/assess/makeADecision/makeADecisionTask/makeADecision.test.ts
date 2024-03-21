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
        decisionRationale: 'decisionRationale',
      })
      expect(page.body).toEqual({
        decision: 'accommodationNeedOnly',
        decisionRationale: 'decisionRationale',
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
    it('should have an error if the decision is rejected and a reason has not been provided', () => {
      const page = new MakeADecision({
        decision: 'informationNotProvided',
      })

      expect(page.errors()).toEqual({
        decisionRationale: 'You must provide the rationale for your decision',
      })
    })
  })

  describe('no errors', () => {
    it.each(['accept', 'withdrawnByPp'])(
      'should not raise error if the decision is %s and a reason has not been provided',
      async decision => {
        const page = new MakeADecision({
          decision,
        })

        expect(page.errors()).toEqual({})
      },
    )
  })

  describe('response', () => {
    it('returns the response', () => {
      const page = new MakeADecision({
        decision: 'informationNotProvided',
      })

      expect(page.response()).toEqual({
        Decision: 'Reject, insufficient information: Requested information not provided by probation practitioner',
      })
    })
  })
})
