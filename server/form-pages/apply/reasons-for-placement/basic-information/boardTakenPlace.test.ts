import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import BoardTakenPlace from './boardTakenPlace'

describe('BoardTakenPlace', () => {
  const body = {
    hasBoardTakenPlace: 'yes' as const,
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new BoardTakenPlace(body)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new BoardTakenPlace(body), 'male-ap')
  itShouldHavePreviousValue(new BoardTakenPlace(body), 'complex-case-board')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new BoardTakenPlace(fromPartial({}))

      expect(page.errors()).toEqual({
        hasBoardTakenPlace: 'You must specify if the Complex Case Board has taken place',
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new BoardTakenPlace(body)

      expect(page.response()).toEqual({
        'Has the Complex Case Board taken place?': 'Yes',
      })
    })
  })
})
