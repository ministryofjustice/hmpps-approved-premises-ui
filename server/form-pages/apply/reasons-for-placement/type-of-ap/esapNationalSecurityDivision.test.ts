import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { applicationFactory, personFactory } from '../../../../testutils/factories'

import EsapNationalSecurityDivisionBody from './esapNationalSecurityDivision'

describe('EsapNationalSecurityDivisionBody', () => {
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  describe('body', () => {
    it('should set the body', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }, application)

      expect(page.body).toEqual({ managedByNationalSecurityDivision: 'yes' })
    })
  })

  describe('title', () => {
    it("should return a title with the person's name", () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }, application)

      expect(page.title).toEqual('Is John Wayne managed by the National Security Division?')
    })
  })

  itShouldHavePreviousValue(new EsapNationalSecurityDivisionBody({}, application), 'ap-type')

  itShouldHaveNextValue(
    new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }, application),
    'esap-placement-screening',
  )

  describe('errors', () => {
    it('should return an empty object if isExceptionalCase is populated', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if isExceptionalCase is not populated', () => {
      const page = new EsapNationalSecurityDivisionBody({}, application)
      expect(page.errors()).toEqual({
        managedByNationalSecurityDivision: 'You must state if John Wayne is managed by the National Security Division',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }, application)

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })
  })
})
