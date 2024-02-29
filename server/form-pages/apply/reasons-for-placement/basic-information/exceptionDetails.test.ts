import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import ExceptionDetails, { ExceptionDetailsBody } from './exceptionDetails'

describe('ExceptionDetails', () => {
  const body = {
    agreedCaseWithManager: 'yes',
    managerName: 'Mr Manager',
    agreementSummary: 'Some Summary',
    'agreementDate-year': '2023',
    'agreementDate-month': '12',
    'agreementDate-day': '1',
  } as ExceptionDetailsBody

  describe('body', () => {
    it('should set the body', () => {
      const page = new ExceptionDetails(body)

      expect(page.body).toEqual({
        agreedCaseWithManager: 'yes',
        managerName: 'Mr Manager',
        agreementSummary: 'Some Summary',
        'agreementDate-year': '2023',
        'agreementDate-month': '12',
        'agreementDate-day': '1',
        agreementDate: '2023-12-01',
      })
    })
  })

  itShouldHavePreviousValue(new ExceptionDetails({}), 'is-exceptional-case')

  describe('when agreedCaseWithManager is yes', () => {
    itShouldHaveNextValue(new ExceptionDetails({ agreedCaseWithManager: 'yes' }), 'confirm-your-details')
  })

  describe('when agreedCaseWithManager is no', () => {
    itShouldHaveNextValue(new ExceptionDetails({ agreedCaseWithManager: 'no' }), 'not-eligible')
  })

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new ExceptionDetails(body)
      expect(page.errors()).toEqual({})
    })

    it('should return errors if agreedCaseWithManager is blank', () => {
      const page = new ExceptionDetails({})
      expect(page.errors()).toEqual({
        agreedCaseWithManager: 'You must state if you have agreed the case with a senior manager',
      })
    })

    it('should return errors if agreedCaseWithManager is yes and the required fields are blank', () => {
      const page = new ExceptionDetails({
        ...body,
        'agreementDate-year': '',
        'agreementDate-month': '',
        'agreementDate-day': '',
        managerName: '',
        agreementSummary: '',
      })
      expect(page.errors()).toEqual({
        agreementDate: 'You must provide an agreement date',
        managerName: 'You must provide the name of the senior manager',
        agreementSummary: 'You must provide a summary of the reasons why this is an exempt application',
      })
    })

    it('should return errors if the agreement date is invalid', () => {
      const page = new ExceptionDetails({
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
      const page = new ExceptionDetails(body)

      expect(page.response()).toEqual({
        'Have you agreed the case with a senior manager?': 'Yes',
        'Name of senior manager': 'Mr Manager',
        'Provide a summary of the reasons why this is an exempt application': 'Some Summary',
        'What date was this agreed?': DateFormats.dateAndTimeInputsToUiDate(body, 'agreementDate'),
      })
    })
  })
})
