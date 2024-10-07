import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import config from '../../../../config'

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
      config.flags.weEnabled = true
      const page = new MaleAp(fromPartial({}))

      expect(page.errors()).toEqual({
        shouldPersonBePlacedInMaleAp: 'You must specify what type of AP the complex case board has agreed to',
      })
    })
    it('should return errors when yes/no questions are blank (pre womens estate)', () => {
      config.flags.weEnabled = false
      const page = new MaleAp(fromPartial({}))

      expect(page.errors()).toEqual({
        shouldPersonBePlacedInMaleAp:
          'You must specify if the Complex Case Board determined that the person should be placed in a male AP',
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      config.flags.weEnabled = true
      const page = new MaleAp(body)

      expect(page.response()).toEqual({
        'What type of AP has the complex case board agreed to?': "Men's AP",
      })
    })
    it('returns the response in human readable form (pre womens estate)', () => {
      config.flags.weEnabled = false
      const page = new MaleAp(body)

      expect(page.response()).toEqual({
        'Has the Complex Case Board determined that the person should be placed in a male AP?': 'Yes',
      })
    })
  })
})
