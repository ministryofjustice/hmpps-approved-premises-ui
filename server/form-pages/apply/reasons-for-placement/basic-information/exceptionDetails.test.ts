import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared'

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

    it('should return errors if the required fields are blank', () => {
      const page = new ExceptionDetails({
        ...body,
        'agreementDate-year': '',
        'agreementDate-month': '',
        'agreementDate-day': '',
        managerName: '',
        agreementSummary: '',
      })
      expect(page.errors()).toEqual({
        managerName: 'Enter the name of the senior manager who approved the exemption',
        agreementDate: 'Enter a date of approval',
        agreementSummary: 'Enter a reason for the exceptional case',
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
        agreementDate: 'Enter a date of approval',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new ExceptionDetails(body)

      expect(page.response()).toEqual({
        'Name of senior manager who approved exemption': 'Mr Manager',
        'Date of approval': DateFormats.dateAndTimeInputsToUiDate(body, 'agreementDate'),
        'Reason for exceptional case': 'Some Summary',
      })
    })
  })
})
