import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import DateOfOffence from './dateOfOffence'

jest.mock('../../../utils/formUtils')

describe('DateOfOffence', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new DateOfOffence({
        arsonOffence: 'current',
        onlineSexualOffence: ['previous', 'current'],
        hateCrime: 'previous',
        something: 'else',
      })

      expect(page.body).toEqual({
        arsonOffence: 'current',
        onlineSexualOffence: ['previous', 'current'],
        hateCrime: 'previous',
      })
    })
  })

  itShouldHavePreviousValue(new DateOfOffence({}), 'type-of-convicted-offence')

  itShouldHaveNextValue(new DateOfOffence({}), 'rehabilitative-interventions')

  describe('errors', () => {
    it('should return an empty object if the time period for one offence is present', () => {
      const page = new DateOfOffence({ arsonOffence: 'current' })
      expect(page.errors()).toEqual({})
    })
    it('should return an error object there is no reponsess', () => {
      const page = new DateOfOffence({})
      expect(page.errors()).toEqual({ arsonOffence: 'You must enter a time period for one or more offence' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DateOfOffence({
        arsonOffence: 'current',
        hateCrime: 'previous',
        onlineSexualOffence: ['previous', 'current'],
      })

      expect(page.response()).toEqual({
        'Date of convicted offences': {
          'Is the offence a current or previous offence?': {
            'Arson offence': 'Current',
            'Hate crime': 'Previous',
            'In person sexual offence': 'Neither',
            'Online sexual offence': 'Current and previous',
          },
        },
      })
    })
  })

  describe('getPlainEnglishAnswerFromFormData', () => {
    it('should return "Neither" if the property is undefined', () => {
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData(undefined)).toBe('Neither')
    })
    it('should return the answer in sentence case if only one answer is present', () => {
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData('current')).toBe('Current')
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData('previous')).toBe('Previous')
    })
    it('should return "Current and previous if both answers are present', () => {
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData(['current', 'previous'])).toBe(
        'Current and previous',
      )
    })
  })

  describe('renderTableHead', () => {
    it('returns the header row', () => {
      const result = new DateOfOffence({}).renderTableHead()
      expect(result).toEqual([{ text: 'Offence' }, { text: 'Current' }, { text: 'Previous' }])
    })
  })

  describe('renderTableRow', () => {
    it('returns a table row', () => {
      const result = new DateOfOffence({}).renderTableRow('arsonOffence')
      expect(result).toEqual([
        { text: 'Arson offence' },
        {
          html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="arsonOffence-current" name="arsonOffence" type="checkbox" value="current">
                <label class="govuk-label govuk-checkboxes__label" for="arsonOffence-current"></label>
            </div>`,
        },
        {
          html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="arsonOffence-previous" name="arsonOffence" type="checkbox" value="previous">
                <label class="govuk-label govuk-checkboxes__label" for="arsonOffence-previous"></label>
            </div>`,
        },
      ])
    })
  })

  describe('renderTableBody', () => {
    it('returns the table body', () => {
      const result = new DateOfOffence({}).renderTableBody()
      expect(result).toEqual([
        [
          {
            text: 'Arson offence',
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="arsonOffence-current" name="arsonOffence" type="checkbox" value="current">
                <label class="govuk-label govuk-checkboxes__label" for="arsonOffence-current"></label>
            </div>`,
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="arsonOffence-previous" name="arsonOffence" type="checkbox" value="previous">
                <label class="govuk-label govuk-checkboxes__label" for="arsonOffence-previous"></label>
            </div>`,
          },
        ],
        [
          {
            text: 'Hate crime',
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="hateCrime-current" name="hateCrime" type="checkbox" value="current">
                <label class="govuk-label govuk-checkboxes__label" for="hateCrime-current"></label>
            </div>`,
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="hateCrime-previous" name="hateCrime" type="checkbox" value="previous">
                <label class="govuk-label govuk-checkboxes__label" for="hateCrime-previous"></label>
            </div>`,
          },
        ],
        [
          {
            text: 'In person sexual offence',
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="inPersonSexualOffence-current" name="inPersonSexualOffence" type="checkbox" value="current">
                <label class="govuk-label govuk-checkboxes__label" for="inPersonSexualOffence-current"></label>
            </div>`,
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="inPersonSexualOffence-previous" name="inPersonSexualOffence" type="checkbox" value="previous">
                <label class="govuk-label govuk-checkboxes__label" for="inPersonSexualOffence-previous"></label>
            </div>`,
          },
        ],
        [
          {
            text: 'Online sexual offence',
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="onlineSexualOffence-current" name="onlineSexualOffence" type="checkbox" value="current">
                <label class="govuk-label govuk-checkboxes__label" for="onlineSexualOffence-current"></label>
            </div>`,
          },
          {
            html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="onlineSexualOffence-previous" name="onlineSexualOffence" type="checkbox" value="previous">
                <label class="govuk-label govuk-checkboxes__label" for="onlineSexualOffence-previous"></label>
            </div>`,
          },
        ],
      ])
    })
  })
})
