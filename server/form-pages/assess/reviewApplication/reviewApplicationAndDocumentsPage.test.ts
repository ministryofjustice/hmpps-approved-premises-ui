import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import Review from './reviewApplicationAndDocumentsPage'

describe('Review', () => {
  describe('title', () => {
    expect(new Review({}, assessment).title).toBe('Review application')
  })

  describe('body', () => {
    it('should set the body', () => {
      const page = new Review({ reviewed: 'yes' }, assessment)
      expect(page.body).toEqual({ reviewed: 'yes' })
    })
  })

  itShouldHaveNextValue(new Review({}), '')

  itShouldHavePreviousValue(new Review({}, assessment), 'dashboard')

  describe('errors', () => {
    it('should have an error if there is no answer', () => {
      const page = new Review({}, assessment)

      expect(page.errors()).toEqual({
        reviewed: 'You must review all of the application and documents provided before proceeding',
      })
    })

    it('should have an error if the answer is "no"', () => {
      const page = new Review({ reviewed: 'no' }, assessment)

      expect(page.errors()).toEqual({
        reviewed: 'You must review all of the application and documents provided before proceeding',
      })
    })
  })

  describe('response', () => {
    it('returns an empty object', () => {
      const page = new Review({ reviewed: 'yes' }, assessment)

      expect(page.response()).toEqual({})
    })
  })
})
