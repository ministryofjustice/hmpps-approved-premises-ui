import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import MaleAp from './maleAp'

describe('MaleAp', () => {
  const body = {
    shouldPersonBePlacedInMaleAp: 'yes' as const,
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new MaleAp(body)

      expect(page.question).toEqual(
        'Has the Complex Case Board determined that the person should be placed in a male AP?',
      )
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new MaleAp(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new MaleAp(body), 'sentence-type')
  itShouldHavePreviousValue(new MaleAp(body), 'board-taken-place')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new MaleAp(fromPartial({}))

      expect(page.errors()).toEqual({
        shouldPersonBePlacedInMaleAp:
          'You must specify if the Complex Case Board determined that the person should be placed in a male AP',
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new MaleAp(body)

      expect(page.response()).toEqual({
        'Has the Complex Case Board determined that the person should be placed in a male AP?': 'Yes',
      })
    })
  })
})
