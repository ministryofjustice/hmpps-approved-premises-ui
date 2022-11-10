import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import ComplexCaseBoard from './complexCaseBoard'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('ComplexCaseBoard', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    complexCaseBoard: 'yes',
    complexCaseBoardDetail: 'Complex case board detail',
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new ComplexCaseBoard(body, application)

      expect(page.questions).toEqual({
        complexCaseBoard: "Does John Wayne's gender identity require a complex case board to review their application?",
      })
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new ComplexCaseBoard({ ...body, something: 'else' }, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new ComplexCaseBoard(body, application), 'catering')
  itShouldHavePreviousValue(new ComplexCaseBoard(body, application), 'previous-placements')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new ComplexCaseBoard({}, application)

      expect(page.errors()).toEqual({
        complexCaseBoard:
          "You must specify if John Wayne's gender identity requires a complex case board to review their application",
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new ComplexCaseBoard({ ...body, complexCaseBoardDetail: '' }, application)

      expect(page.errors()).toEqual({
        complexCaseBoardDetail:
          "You must specify details about if John Wayne's gender identity requires a complex case board to review their application",
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new ComplexCaseBoard(body, application)

      expect(page.response()).toEqual({
        "Does John Wayne's gender identity require a complex case board to review their application?":
          'Yes - Complex case board detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new ComplexCaseBoard({ ...body, complexCaseBoard: 'no' }, application)

      expect(page.response()).toEqual({
        "Does John Wayne's gender identity require a complex case board to review their application?": 'No',
      })
    })
  })
})
