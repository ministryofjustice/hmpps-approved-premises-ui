import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

import EsapNationalSecurityDivisionBody from './esapNationalSecurityDivision'

describe('EsapNationalSecurityDivisionBody', () => {
  describe('body', () => {
    it('should set the body', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' })

      expect(page.body).toEqual({ managedByNationalSecurityDivision: 'yes' })
    })
  })

  itShouldHavePreviousValue(new EsapNationalSecurityDivisionBody({}), 'ap-type')

  describe('when the person is managed by the national security division', () => {
    itShouldHaveNextValue(
      new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' }),
      'esap-placement-screening',
    )
  })

  describe('when the person is not managed by the national security division', () => {
    itShouldHaveNextValue(
      new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'no' }),
      'esap-exceptional-case',
    )
  })

  describe('errors', () => {
    it('should return an empty object if isExceptionalCase is populated', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' })
      expect(page.errors()).toEqual({})
    })

    it('should return an errors if isExceptionalCase is not populated', () => {
      const page = new EsapNationalSecurityDivisionBody({})
      expect(page.errors()).toEqual({
        managedByNationalSecurityDivision: 'You must state if the person is managed by the National Security Division',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EsapNationalSecurityDivisionBody({ managedByNationalSecurityDivision: 'yes' })

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
      })
    })
  })
})
