import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ReasonForPlacement from './reason-for-placement'

describe('ReasonForPlacement', () => {
  describe('title', () => {
    expect(new ReasonForPlacement({}).title).toBe('Reason for placement')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ReasonForPlacement({
        reason: 'rotl',
      })
      expect(page.body).toEqual({
        reason: 'rotl',
      })
    })
  })

  itShouldHaveNextValue(new ReasonForPlacement({}), '')
  itShouldHavePreviousValue(new ReasonForPlacement({}), '')

  describe('errors', () => {
    it('if no response is given an error is returned', () => {
      expect(new ReasonForPlacement({}).errors()).toEqual({
        reason: 'You must state the reason for placement',
      })
    })
  })

  describe('response', () => {
    it("If the response is 'no' only the response is returned", () => {
      expect(
        new ReasonForPlacement({
          reason: 'rotl',
        }).response(),
      ).toEqual({
        'Why are you requesting a placement?': 'Release on Temporary Licence (ROTL)',
      })
    })
  })
})
