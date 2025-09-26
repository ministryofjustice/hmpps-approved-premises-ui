import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import ComplexCaseBoard from './complexCaseBoard'

describe('ComplexCaseBoard', () => {
  const body = {
    reviewRequired: 'yes' as const,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new ComplexCaseBoard(body)

      expect(page.body).toEqual(body)
    })
  })

  describe('if the answer is yes', () => {
    itShouldHaveNextValue(new ComplexCaseBoard(body), 'board-taken-place')
  })

  describe('if the answer is no', () => {
    itShouldHaveNextValue(new ComplexCaseBoard({ reviewRequired: 'no' }), 'sentence-type')
  })
  itShouldHavePreviousValue(new ComplexCaseBoard(body), 'transgender')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new ComplexCaseBoard(fromPartial({}))

      expect(page.errors()).toEqual({
        reviewRequired:
          "You must specify if the person's gender identity requires a complex case board to review their application",
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new ComplexCaseBoard(body)

      expect(page.response()).toEqual({
        "Does the person's gender identity require a complex case board to review their application?": 'Yes',
      })
    })
  })
})
