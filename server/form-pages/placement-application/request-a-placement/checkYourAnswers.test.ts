import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { placementApplicationFactory } from '../../../testutils/factories'

import CheckYourAnswers from './checkYourAnswers'

describe('CheckYourAnswers', () => {
  const body = {
    reviewed: '1',
  }
  const placementApplication = placementApplicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new CheckYourAnswers(body, placementApplication)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new CheckYourAnswers(body, placementApplication), '')
  itShouldHavePreviousValue(new CheckYourAnswers(body, placementApplication), 'updates-to-application')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new CheckYourAnswers({}, placementApplication)

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      const page = new CheckYourAnswers({}, placementApplication)

      expect(page.response()).toEqual({})
    })
  })
})
