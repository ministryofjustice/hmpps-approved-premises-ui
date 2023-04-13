import { fromPartial } from '@total-typescript/shoehorn'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import ComplexCaseBoard from './complexCaseBoard'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('ComplexCaseBoard', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    reviewRequired: 'yes' as const,
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new ComplexCaseBoard(body, application)

      expect(page.question).toEqual(
        "Does John Wayne's gender identity require a complex case board to review their application?",
      )
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new ComplexCaseBoard(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('if the answer is yes', () => {
    itShouldHaveNextValue(new ComplexCaseBoard(body, application), 'board-taken-place')
  })

  describe('if the answer is no', () => {
    itShouldHaveNextValue(new ComplexCaseBoard({ reviewRequired: 'no' }, application), 'sentence-type')
  })
  itShouldHavePreviousValue(new ComplexCaseBoard(body, application), 'transgender')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new ComplexCaseBoard(fromPartial({}), application)

      expect(page.errors()).toEqual({
        reviewRequired:
          "You must specify if John Wayne's gender identity requires a complex case board to review their application",
      })
    })
  })

  describe('response', () => {
    it('returns the response in human readable form', () => {
      const page = new ComplexCaseBoard(body, application)

      expect(page.response()).toEqual({
        "Does John Wayne's gender identity require a complex case board to review their application?": 'Yes',
      })
    })
  })
})
