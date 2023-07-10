import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import EndDates, { EndDatesBody } from './endDates'

describe('EndDates', () => {
  const body = {
    'sedDate-year': '2023',
    'sedDate-month': '12',
    'sedDate-day': '1',
    'ledDate-year': '2023',
    'ledDate-month': '12',
    'ledDate-day': '2',
    'pssDate-year': '2023',
    'pssDate-month': '12',
    'pssDate-day': '3',
  } as EndDatesBody

  const emptyDateBody = {
    'sedDate-day': '',
    'sedDate-month': '',
    'sedDate-year': '',
    'ledDate-day': '',
    'ledDate-month': '',
    'ledDate-year': '',
    'pssDate-day': '',
    'pssDate-month': '',
    'pssDate-year': '',
  }
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body when all the dates are present', () => {
      const page = new EndDates(body, application)

      expect(page.body).toEqual(body)
    })

    it('should set the body when all the dates not present', () => {
      const page = new EndDates(emptyDateBody, application)

      expect(page.body).toEqual({
        sedDate: undefined,
        'sedDate-day': '',
        'sedDate-month': '',
        'sedDate-year': '',
        ledDate: undefined,
        'ledDate-day': '',
        'ledDate-month': '',
        'ledDate-year': '',
        pssDate: undefined,
        'pssDate-day': '',
        'pssDate-month': '',
        'pssDate-year': '',
      })
    })
  })

  describe('when the exception-details step was not completed', () => {
    itShouldHavePreviousValue(new EndDates({}, application), 'transgender')
  })

  describe('when the exception-details step was completed', () => {
    itShouldHavePreviousValue(
      new EndDates(
        {},
        { ...application, data: { 'basic-information': { 'exception-details': { agreedCaseWithManager: 'yes' } } } },
      ),
      'exception-details',
    )
  })

  itShouldHaveNextValue(new EndDates(body, application), 'sentence-type')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new EndDates(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if an invalid date is entered', () => {
      const page = new EndDates(
        {
          'pssDate-day': '32',
          'pssDate-month': '13',
          'pssDate-year': '2023',
          'sedDate-day': '32',
          'sedDate-month': '13',
          'sedDate-year': '2023',
          'ledDate-day': '32',
          'ledDate-month': '13',
          'ledDate-year': '2023',
        },
        application,
      )
      expect(page.errors()).toEqual({
        ledDate: 'Licence end date (LED) must be a valid date',
        pssDate: 'Post-sentence supervision (PSS) must be a valid date',
        sedDate: 'Sentence end date (SED) must be a valid date',
      })
    })
  })
  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EndDates(body, application)

      expect(page.response()).toEqual({
        'Licence end date (LED)': 'Saturday 2 December 2023',
        'Post-sentence supervision (PSS)': 'Sunday 3 December 2023',
        'Sentence end date (SED)': 'Friday 1 December 2023',
      })
    })

    it('should return a translated version of the response when the dates are blank', () => {
      const page = new EndDates(emptyDateBody, application)

      expect(page.response()).toEqual({
        'Licence end date (LED)': 'No date supplied',
        'Post-sentence supervision (PSS)': 'No date supplied',
        'Sentence end date (SED)': 'No date supplied',
      })
    })
  })
})
