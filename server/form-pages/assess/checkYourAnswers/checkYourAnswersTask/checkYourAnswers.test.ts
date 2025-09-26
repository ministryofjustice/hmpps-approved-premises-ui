import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import Review from './checkYourAnswers'
import { assessmentFactory } from '../../../../testutils/factories'

describe('Review', () => {
  const assessment = assessmentFactory.build({})

  const body = {
    reviewed: '1',
  }

  describe('body', () => {
    it('should set the body', () => {
      const page = new Review(body, assessment)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHaveNextValue(new Review(body, assessment), '')
  itShouldHavePreviousValue(new Review(body, assessment), 'dashboard')

  describe('errors', () => {
    it('should return an empty object', () => {
      const page = new Review({}, assessment)

      expect(page.errors()).toEqual({})
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      const page = new Review({}, assessment)

      expect(page.response()).toEqual({})
    })
  })
})
