import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared'

import SameAp from './sameAp'

describe('SameAp', () => {
  describe('title', () => {
    expect(new SameAp({}).title).toBe('Do you want this person to stay in the same Approved Premises (AP)?')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new SameAp({
        sameAp: 'yes',
      })
      expect(page.body).toEqual({
        sameAp: 'yes',
      })
    })
  })

  itShouldHaveNextValue(new SameAp({}), 'dates-of-placement')
  itShouldHavePreviousValue(new SameAp({}), 'previous-rotl-placement')

  describe('errors', () => {
    it('if no response is given an error is returned', () => {
      expect(new SameAp({}).errors()).toEqual({
        sameAp: 'You must state whether you want this person to stay in the same AP',
      })
    })
  })

  describe('response', () => {
    it('Returns the plain english response', () => {
      expect(
        new SameAp({
          sameAp: 'yes',
        }).response(),
      ).toEqual({
        'Do you want this person to stay in the same Approved Premises (AP)?': 'Yes',
      })
    })
  })
})
