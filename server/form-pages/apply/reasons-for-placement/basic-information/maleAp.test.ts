import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MaleAp from './maleAp'

describe('MaleAp', () => {
  const body = {
    shouldPersonBePlacedInMaleAp: 'yes' as const,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new MaleAp(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new MaleAp(body), 'relevant-dates')
  itShouldHavePreviousValue(new MaleAp(body), 'board-taken-place')

  describe('errors', () => {
    it('should return errors when no ap type is selected', () => {
      const page = new MaleAp(fromPartial({}))

      expect(page.errors()).toEqual({
        shouldPersonBePlacedInMaleAp: 'You must specify what type of AP the complex case board has agreed to',
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new MaleAp(body)

      expect(page.response()).toEqual({
        'What type of AP has the complex case board agreed to?': "Men's AP",
      })
    })
  })
})
