import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import Catering from './catering'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('Catering', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    catering: 'yes',
    cateringDetail: 'Catering detail',
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new Catering(body, application)

      expect(page.questions).toEqual({
        catering: 'Do you have any concerns about John Wayne catering for themselves?',
      })
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new Catering({ ...body, something: 'else' }, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Catering(body, application), 'arson')
  itShouldHavePreviousValue(new Catering(body, application), 'complex-case-board')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Catering({}, application)

      expect(page.errors()).toEqual({
        catering: 'You must specify if you have any concerns about John Wayne catering for themselves',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new Catering({ ...body, cateringDetail: '' }, application)

      expect(page.errors()).toEqual({
        cateringDetail:
          'You must specify details about if you have any concerns about John Wayne catering for themselves',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new Catering(body, application)

      expect(page.response()).toEqual({
        'Do you have any concerns about John Wayne catering for themselves?': 'Yes - Catering detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new Catering({ ...body, catering: 'no' }, application)

      expect(page.response()).toEqual({
        'Do you have any concerns about John Wayne catering for themselves?': 'No',
      })
    })
  })
})
