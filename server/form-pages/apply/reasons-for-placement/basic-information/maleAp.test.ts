import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

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

  itShouldHaveNextValue(new MaleAp(body), 'complex-case-board')
  itShouldHavePreviousValue(new MaleAp(body), 'transgender')

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
        'What type of AP does the person need?': "Men's AP",
      })
    })
  })
})
