import { applicationFactory } from '../../../../testutils/factories'
import { DateFormats } from '../../../../utils/dateUtils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import RelevantDates, { RelevantDateKeys, RelevantDatesBody, relevantDateKeys } from './relevantDates'

describe('RelevantDates', () => {
  const body = {
    homeDetentionCurfewDate: '2023-01-01',
    'homeDetentionCurfewDate-day': '01',
    'homeDetentionCurfewDate-month': '01',
    'homeDetentionCurfewDate-year': '2023',
    licenceExpiryDate: '2023-02-02',
    'licenceExpiryDate-day': '02',
    'licenceExpiryDate-month': '02',
    'licenceExpiryDate-year': '2023',
    paroleEligibilityDate: '2023-03-03',
    'paroleEligibilityDate-day': '03',
    'paroleEligibilityDate-month': '03',
    'paroleEligibilityDate-year': '2023',
    pssEndDate: '2023-04-04',
    'pssEndDate-day': '04',
    'pssEndDate-month': '04',
    'pssEndDate-year': '2023',
    pssStartDate: '2023-05-05',
    'pssStartDate-day': '05',
    'pssStartDate-month': '05',
    'pssStartDate-year': '2023',
    sentenceExpiryDate: '2023-06-06',
    'sentenceExpiryDate-day': '06',
    'sentenceExpiryDate-month': '06',
    'sentenceExpiryDate-year': '2023',
    selectedDates: relevantDateKeys,
  } as RelevantDatesBody

  const emptyDateBody = {
    homeDetentionCurfewDate: undefined as string,
    'homeDetentionCurfewDate-day': '',
    'homeDetentionCurfewDate-month': '',
    'homeDetentionCurfewDate-year': '',
    licenceExpiryDate: undefined as string,
    'licenceExpiryDate-day': '',
    'licenceExpiryDate-month': '',
    'licenceExpiryDate-year': '',
    paroleEligibilityDate: undefined as string,
    'paroleEligibilityDate-day': '',
    'paroleEligibilityDate-month': '',
    'paroleEligibilityDate-year': '',
    pssEndDate: undefined as string,
    'pssEndDate-day': '',
    'pssEndDate-month': '',
    'pssEndDate-year': '',
    pssStartDate: undefined as string,
    'pssStartDate-day': '',
    'pssStartDate-month': '',
    'pssStartDate-year': '',
    sentenceExpiryDate: undefined as string,
    'sentenceExpiryDate-day': '',
    'sentenceExpiryDate-month': '',
    'sentenceExpiryDate-year': '',
  }
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body when all the dates are present', () => {
      const page = new RelevantDates(body, application)

      expect(page.body).toEqual(body)
    })

    it('should set the body when all the dates not present', () => {
      const page = new RelevantDates(emptyDateBody, application)

      expect(page.body).toEqual(emptyDateBody)
    })
  })

  describe('when the exception-details step was not completed', () => {
    itShouldHavePreviousValue(new RelevantDates({}, application), 'transgender')
  })

  describe('when the exception-details step was completed', () => {
    itShouldHavePreviousValue(
      new RelevantDates(
        {},
        { ...application, data: { 'basic-information': { 'exception-details': { agreedCaseWithManager: 'yes' } } } },
      ),
      'exception-details',
    )
  })

  itShouldHaveNextValue(new RelevantDates(body, application), 'sentence-type')

  describe('errors', () => {
    it('should return an empty object if the body is provided correctly', () => {
      const page = new RelevantDates(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if an invalid date is entered', () => {
      const page = new RelevantDates(
        {
          ...body,
          'sentenceExpiryDate-day': '32',
          'homeDetentionCurfewDate-day': '32',
          'licenceExpiryDate-day': '32',
          'paroleEligibilityDate-day': '32',
          'pssEndDate-day': '32',
          'pssStartDate-day': '32',
        },
        application,
      )

      expect(page.errors()).toEqual({
        sentenceExpiryDate: 'Sentence expiry date must be a valid date',
        homeDetentionCurfewDate: 'Home Detention Curfew (HDC) date must be a valid date',
        licenceExpiryDate: 'Licence expiry date must be a valid date',
        paroleEligibilityDate: 'Parole eligibility date must be a valid date',
        pssEndDate: 'Post sentence supervision (PSS) end date must be a valid date',
        pssStartDate: 'Post sentence supervision (PSS) start date must be a valid date',
      })
    })

    it('should return an "empty date" error if the date is empty and in selectedDates array', () => {
      const page = new RelevantDates(
        {
          selectedDates: relevantDateKeys,
        },
        application,
      )

      expect(page.errors()).toEqual({
        homeDetentionCurfewDate: 'When the box is checked you must enter a Home Detention Curfew (HDC) date date',
        licenceExpiryDate: 'When the box is checked you must enter a Licence expiry date date',
        paroleEligibilityDate: 'When the box is checked you must enter a Parole eligibility date date',
        pssEndDate: 'When the box is checked you must enter a Post sentence supervision (PSS) end date date',
        pssStartDate: 'When the box is checked you must enter a Post sentence supervision (PSS) start date date',
        sentenceExpiryDate: 'When the box is checked you must enter a Sentence expiry date date',
      })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new RelevantDates(body, application)

      expect(page.response()).toEqual({
        'Home Detention Curfew (HDC) date': DateFormats.dateAndTimeInputsToUiDate(body, 'homeDetentionCurfewDate'),
        'Licence expiry date': DateFormats.dateAndTimeInputsToUiDate(body, 'licenceExpiryDate'),
        'Parole eligibility date': DateFormats.dateAndTimeInputsToUiDate(body, 'paroleEligibilityDate'),
        'Post sentence supervision (PSS) end date': DateFormats.dateAndTimeInputsToUiDate(body, 'pssEndDate'),
        'Post sentence supervision (PSS) start date': DateFormats.dateAndTimeInputsToUiDate(body, 'pssStartDate'),
        'Sentence expiry date': DateFormats.dateAndTimeInputsToUiDate(body, 'sentenceExpiryDate'),
      })
    })

    it('should return a translated version of the response when the dates are blank', () => {
      const page = new RelevantDates({ ...emptyDateBody, selectedDates: relevantDateKeys }, application)

      expect(page.response()).toEqual({
        'Home Detention Curfew (HDC) date': 'No date supplied',
        'Licence expiry date': 'No date supplied',
        'Parole eligibility date': 'No date supplied',
        'Post sentence supervision (PSS) end date': 'No date supplied',
        'Post sentence supervision (PSS) start date': 'No date supplied',
        'Sentence expiry date': 'No date supplied',
      })
    })

    it('should ignore a date when not included in selectedDates', () => {
      const page = new RelevantDates({ ...body, selectedDates: [] as Array<RelevantDateKeys> }, application)

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
