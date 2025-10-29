import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'
import { applicationFactory } from '../../../../testutils/factories'

import IsExceptionalCase from './isExceptionalCase'

describe('IsExceptionalCase', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new IsExceptionalCase({ isExceptionalCase: 'yes' }, application)

      expect(page.body).toEqual({ isExceptionalCase: 'yes' })
    })
  })

  itShouldHavePreviousValue(new IsExceptionalCase({}, application), 'dashboard')

  describe('when isExceptionalCase is yes', () => {
    itShouldHaveNextValue(new IsExceptionalCase({ isExceptionalCase: 'yes' }, application), 'exception-details')
  })

  describe('when isExceptionalCase is no', () => {
    itShouldHaveNextValue(new IsExceptionalCase({ isExceptionalCase: 'no' }, application), 'not-eligible')
  })

  describe('errors', () => {
    it('should return an empty object if isExceptionalCase is populated', () => {
      const page = new IsExceptionalCase({ isExceptionalCase: 'yes' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if isExceptionalCase is not populated', () => {
      const page = new IsExceptionalCase({}, application)
      expect(page.errors()).toEqual({ isExceptionalCase: 'You must state if this application is an exceptional case' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new IsExceptionalCase({ isExceptionalCase: 'yes' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })
  })
})
