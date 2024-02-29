import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import EsapExceptionalCase, { EsapExceptionalCaseBody } from './esapExceptionalCase'

describe('EsapExceptionalCase', () => {
  const body = {
    agreedCaseWithCommunityHopp: 'yes',
    communityHoppName: 'Mr Manager',
    agreementSummary: 'Some Summary',
    'agreementDate-year': '2023',
    'agreementDate-month': '12',
    'agreementDate-day': '1',
  } as EsapExceptionalCaseBody

  describe('body', () => {
    it('should set the body', () => {
      const page = new EsapExceptionalCase(body)

      expect(page.body).toEqual({
        agreedCaseWithCommunityHopp: 'yes',
        communityHoppName: 'Mr Manager',
        agreementSummary: 'Some Summary',
        'agreementDate-year': '2023',
        'agreementDate-month': '12',
        'agreementDate-day': '1',
        agreementDate: '2023-12-01',
      })
    })
  })

  itShouldHavePreviousValue(new EsapExceptionalCase({}), 'managed-by-national-security-division')

  describe('when agreedCaseWithCommunityHopp is yes', () => {
    itShouldHaveNextValue(new EsapExceptionalCase(body), 'esap-placement-screening')
  })

  describe('when agreedCaseWithCommunityHopp is no', () => {
    itShouldHaveNextValue(new EsapExceptionalCase({ ...body, agreedCaseWithCommunityHopp: 'no' }), 'not-esap-eligible')
  })

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new EsapExceptionalCase(body)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if agreedCaseWithCommunityHopp is blank', () => {
      const page = new EsapExceptionalCase({})
      expect(page.errors()).toEqual({
        agreedCaseWithCommunityHopp:
          'You must state if you have agreed the case with the Community Head of Public Protection',
      })
    })

    it('should return errors if agreedCaseWithCommunityHopp is yes and the required fields are blank', () => {
      const page = new EsapExceptionalCase({
        ...body,
        'agreementDate-year': '',
        'agreementDate-month': '',
        'agreementDate-day': '',
        communityHoppName: '',
        agreementSummary: '',
      })
      expect(page.errors()).toEqual({
        agreementDate: 'You must provide an agreement date',
        communityHoppName: 'You must provide the name of the Community Head of Public Protection',
        agreementSummary: 'You must provide a summary of the reasons why this is an exempt application',
      })
    })

    it('should return errors if the agreement date is invalid', () => {
      const page = new EsapExceptionalCase({
        ...body,
        'agreementDate-year': '99999',
        'agreementDate-month': '99999',
        'agreementDate-day': '199999',
      })
      expect(page.errors()).toEqual({
        agreementDate: 'The agreement date is an invalid date',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EsapExceptionalCase(body)

      expect(page.response()).toEqual({
        [`${page.title}`]: 'Yes',
        'Name of Community HOPP': 'Mr Manager',
        'Provide a summary of the reasons why this is an exempt application': 'Some Summary',
        'Date of agreement': DateFormats.dateAndTimeInputsToUiDate(body, 'agreementDate'),
      })
    })
  })
})
