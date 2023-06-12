import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import Catering from './catering'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

describe('Catering', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    catering: 'no' as const,
    cateringDetail: 'Catering detail',
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new Catering(body, application)

      expect(page.questions).toEqual({
        catering: 'Can John Wayne be placed in a self-catered Approved Premises (AP)?',
      })
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Catering(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Catering(body, application), 'arson')
  itShouldHavePreviousValue(new Catering(body, application), 'complex-case-board')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Catering({}, application)

      expect(page.errors()).toEqual({
        catering: 'You must specify if John Wayne can be placed in a self-catered Approved Premises (AP)',
      })
    })

    it('shows errors when a question has a no response, but the details are left out', () => {
      const page = new Catering({ ...body, cateringDetail: '' }, application)

      expect(page.errors()).toEqual({
        cateringDetail: 'You must specify details if you have any concerns about John Wayne catering for themselves',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is no', () => {
      const page = new Catering(body, application)

      expect(page.response()).toEqual({
        'Can John Wayne be placed in a self-catered Approved Premises (AP)?': 'No - Catering detail',
      })
    })

    it('does not add detail to questions with a yes answer', () => {
      const page = new Catering({ ...body, catering: 'yes' }, application)

      expect(page.response()).toEqual({
        'Can John Wayne be placed in a self-catered Approved Premises (AP)?': 'Yes',
      })
    })
  })
})
