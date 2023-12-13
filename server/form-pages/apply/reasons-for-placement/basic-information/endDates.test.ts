import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import EndDates, { EndDatesBody, relevantDateKeys } from './endDates'

describe('EndDates', () => {
  const body = {
    homeDetentionCurfewDate: '2023-01-01',
    'homeDetentionCurfewDate-day': '01',
    'homeDetentionCurfewDate-month': '01',
    'homeDetentionCurfewDate-year': '2023',
    licenceExpiryDate: '2023-02-02',
    'licenceExpiryDate-day': '02',
    'licenceExpiryDate-month': '02',
    'licenceExpiryDate-year': '2023',
    paroleEligbilityDate: '2023-03-03',
    'paroleEligbilityDate-day': '03',
    'paroleEligbilityDate-month': '03',
    'paroleEligbilityDate-year': '2023',
    pssEndDate: '2023-04-04',
    'pssEndDate-day': '04',
    'pssEndDate-month': '04',
    'pssEndDate-year': '2023',
    pssStartDate: '2023-05-05',
    'pssStartDate-day': '05',
    'pssStartDate-month': '05',
    'pssStartDate-year': '2023',
    sedDate: '2023-06-06',
    'sedDate-day': '06',
    'sedDate-month': '06',
    'sedDate-year': '2023',
    selectedDates: relevantDateKeys,
  } as EndDatesBody

  const emptyDateBody = {
    homeDetentionCurfewDate: undefined as string,
    'homeDetentionCurfewDate-day': '',
    'homeDetentionCurfewDate-month': '',
    'homeDetentionCurfewDate-year': '',
    licenceExpiryDate: undefined as string,
    'licenceExpiryDate-day': '',
    'licenceExpiryDate-month': '',
    'licenceExpiryDate-year': '',
    paroleEligbilityDate: undefined as string,
    'paroleEligbilityDate-day': '',
    'paroleEligbilityDate-month': '',
    'paroleEligbilityDate-year': '',
    pssEndDate: undefined as string,
    'pssEndDate-day': '',
    'pssEndDate-month': '',
    'pssEndDate-year': '',
    pssStartDate: undefined as string,
    'pssStartDate-day': '',
    'pssStartDate-month': '',
    'pssStartDate-year': '',
    sedDate: undefined as string,
    'sedDate-day': '',
    'sedDate-month': '',
    'sedDate-year': '',
  }
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body when all the dates are present', () => {
      const page = new EndDates(body, application)

      expect(page.body).toEqual(body)
    })

    it('should set the body when all the dates not present', () => {
      const page = new RelevantDates(emptyDateBody, application)

      expect(page.body).toEqual(emptyDateBody)
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
          ...body,
          'sedDate-day': '32',
          'homeDetentionCurfewDate-day': '32',
          'licenceExpiryDate-day': '32',
          'paroleEligbilityDate-day': '32',
          'pssEndDate-day': '32',
          'pssStartDate-day': '32',
        },
        application,
      )

      expect(page.errors()).toEqual({
        sedDate: 'Sentence expiry date must be a valid date',
        homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date must be a valid date',
        licenceExpiryDate: 'Licence expiry date must be a valid date',
        paroleEligbilityDate: 'Parole eligibility date must be a valid date',
        pssEndDate: 'Post sentence supervision (PSS) end date must be a valid date',
        pssStartDate: 'Post sentence supervision (PSS) start date must be a valid date',
      })
    })

    it('should return an "empty date" error if the date is empty and in selectedDates array', () => {
      const page = new EndDates(
        {
          selectedDates: relevantDateKeys,
        },
        application,
      )

      expect(page.errors()).toEqual({
        homeDetentionCurfewDate: 'When the box is checked you must enter a Home Detention Curfew (HDC) date date',
        licenceExpiryDate: 'When the box is checked you must enter a Licence expiry date date',
        paroleEligbilityDate: 'When the box is checked you must enter a Parole eligibility date date',
        pssEndDate: 'When the box is checked you must enter a Post sentence supervision (PSS) end date date',
        pssStartDate: 'When the box is checked you must enter a Post sentence supervision (PSS) start date date',
        sedDate: 'When the box is checked you must enter a Sentence expiry date date',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new EndDates(body, application)

      expect(page.response()).toEqual({
        'Home Detention Curfew (HDC) date': 'Sunday 1 January 2023',
        'Licence expiry date': 'Thursday 2 February 2023',
        'Parole eligibility date': 'Friday 3 March 2023',
        'Post sentence supervision (PSS) end date': 'Tuesday 4 April 2023',
        'Post sentence supervision (PSS) start date': 'Friday 5 May 2023',
        'Sentence expiry date': 'Tuesday 6 June 2023',
      })
    })

    it('should return a translated version of the response when the dates are blank', () => {
      const page = new EndDates({ ...emptyDateBody, selectedDates: relevantDateKeys }, application)

      expect(page.response()).toEqual({
        'Home Detention Curfew (HDC) date': 'No date supplied',
        'Licence expiry date': 'No date supplied',
        'Parole eligibility date': 'No date supplied',
        'Post sentence supervision (PSS) end date': 'No date supplied',
        'Post sentence supervision (PSS) start date': 'No date supplied',
        'Sentence expiry date': 'No date supplied',
      })
    })
  })
})
