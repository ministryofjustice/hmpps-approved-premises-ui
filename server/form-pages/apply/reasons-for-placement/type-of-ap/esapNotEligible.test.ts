import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import EsapNotEligible from './esapNotEligible'

describe('EsapNotEligible', () => {
  const person = personFactory.build()
  const application = applicationFactory.build({ person })
  const page = new EsapNotEligible({}, application)

  describe('body', () => {
    it('should set the body', () => {
      expect(page.body).toEqual({})
    })
  })

  itShouldHavePreviousValue(page, 'esap-exceptional-case')

  itShouldHaveNextValue(page, '')

  describe('errors', () => {
    it('should return an object with an error to prevent continuing with the application', () => {
      expect(page.errors()).toEqual({
        esapNotEligible: 'The person is not eligible for an Enhanced Security Approved Premises (ESAP) placement.',
      })
    })
  })

  describe('response', () => {
    it('should return an empty object', () => {
      expect(page.response()).toEqual({})
    })
  })
})
