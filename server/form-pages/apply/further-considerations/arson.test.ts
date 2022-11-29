import { YesOrNo } from '@approved-premises/ui'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import Arson from './arson'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('Arson', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const body = {
    arson: 'yes' as YesOrNo,
    arsonDetail: 'Arson detail',
  }

  describe('title', () => {
    it("adds the person's name to the question titles", () => {
      const page = new Arson(body, application)

      expect(page.questions).toEqual({
        arson: 'Does John Wayne need a specialist arson room?',
      })
    })
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Arson(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Arson(body, application), '')
  itShouldHavePreviousValue(new Arson(body, application), 'catering')

  describe('errors', () => {
    it('should return errors when yes/no questions are blank', () => {
      const page = new Arson({}, application)

      expect(page.errors()).toEqual({
        arson: 'You must specify if John Wayne needs a specialist arson room',
      })
    })

    it('shows errors when a question has a yes response, but the details are left out', () => {
      const page = new Arson({ ...body, arsonDetail: '' }, application)

      expect(page.errors()).toEqual({
        arsonDetail: 'You must specify details about if John Wayne needs a specialist arson room',
      })
    })
  })

  describe('response', () => {
    it('Adds detail to an answer when the answer is yes', () => {
      const page = new Arson(body, application)

      expect(page.response()).toEqual({
        'Does John Wayne need a specialist arson room?': 'Yes - Arson detail',
      })
    })

    it('does not add detail to questions with a no answer', () => {
      const page = new Arson({ ...body, arson: 'no' }, application)

      expect(page.response()).toEqual({
        'Does John Wayne need a specialist arson room?': 'No',
      })
    })
  })
})
