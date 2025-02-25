import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import DateOfOffence from './dateOfOffence'

jest.mock('../../../../utils/formUtils')

describe('DateOfOffence', () => {
  const body = {
    hateCrime: 'previous',
    nonSexualOffencesAgainstChildren: 'current',
    contactSexualOffencesAgainstAdults: ['current', 'previous'],
    nonContactSexualOffencesAgainstAdults: ['current', 'previous'],
    contactSexualOffencesAgainstChildren: ['current', 'previous'],
    nonContactSexualOffencesAgainstChildren: ['current', 'previous'],
  } as const

  describe('body', () => {
    it('should set the body', () => {
      const page = new DateOfOffence(body)

      expect(page.body).toEqual({ ...body, hateCrime: ['previous'], nonSexualOffencesAgainstChildren: ['current'] })
    })
  })

  itShouldHavePreviousValue(new DateOfOffence({}), 'convicted-offences')

  itShouldHaveNextValue(new DateOfOffence({}), 'rehabilitative-interventions')

  describe('errors', () => {
    it('should return an empty object if the time period for one offence is present', () => {
      const page = new DateOfOffence({ hateCrime: 'current' })
      expect(page.errors()).toEqual({})
    })
    it('should return an error object there is no responses', () => {
      const page = new DateOfOffence({})
      expect(page.errors()).toEqual({ hateCrime: 'You must enter a time period for one or more offence' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new DateOfOffence(body)

      expect(page.response()).toEqual({
        'Is the hate crime current or previous?': 'Previous',
        'Is the contact sexual offences against adults current or previous?': 'Current and previous',
        'Is the contact sexual offences against children current or previous?': 'Current and previous',
        'Is the non contact sexual offences against adults current or previous?': 'Current and previous',
        'Is the non contact sexual offences against children current or previous?': 'Current and previous',
        'Is the non sexual offences against children current or previous?': 'Current',
      })
    })
  })

  describe('getPlainEnglishAnswerFromFormData', () => {
    it('should return "Neither" if the property is undefined', () => {
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData(undefined)).toBe('Neither')
    })
    it('should return the answer in sentence case if only one answer is present', () => {
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData(['current'])).toBe('Current')
      expect(new DateOfOffence({}).getPlainEnglishAnswerFromFormData(['previous'])).toBe('Previous')
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
      const result = new DateOfOffence({ hateCrime: ['previous'] }).renderTableRow('hateCrime')
      expect(result).toEqual([
        { text: 'Hate crime' },
        DateOfOffence.checkbox('hateCrime', 'current', false),
        DateOfOffence.checkbox('hateCrime', 'previous', true),
      ])
    })
  })

  describe('renderTableBody', () => {
    it('returns the table body', () => {
      const result = new DateOfOffence({}).renderTableBody()
      expect(result).toEqual([
        new DateOfOffence({}).renderTableRow('hateCrime'),
        new DateOfOffence({}).renderTableRow('nonSexualOffencesAgainstChildren'),
        new DateOfOffence({}).renderTableRow('contactSexualOffencesAgainstAdults'),
        new DateOfOffence({}).renderTableRow('nonContactSexualOffencesAgainstAdults'),
        new DateOfOffence({}).renderTableRow('contactSexualOffencesAgainstChildren'),
        new DateOfOffence({}).renderTableRow('nonContactSexualOffencesAgainstChildren'),
      ])
    })
  })

  describe('checkbox', () => {
    it('it renders the markup for a unselected checkbox', () => {
      expect(DateOfOffence.checkbox('hateCrime', 'current', false)).toEqual({
        html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
          <div class="govuk-checkboxes__item">
          <input class="govuk-checkboxes__input" id="hateCrime-current" name="hateCrime" type="checkbox" value="current" >
              <label class="govuk-label govuk-checkboxes__label" for="hateCrime-current">
                <span class="govuk-visually-hidden">Hate crime: current</span>
              </label>
          </div>
        </div>`,
      })
    })

    it('it renders the markup for a selected checkbox', () => {
      expect(DateOfOffence.checkbox('hateCrime', 'previous', true)).toEqual({
        html: `<div class="govuk-checkboxes" data-module="govuk-checkboxes">
          <div class="govuk-checkboxes__item">
          <input class="govuk-checkboxes__input" id="hateCrime-previous" name="hateCrime" type="checkbox" value="previous" checked>
              <label class="govuk-label govuk-checkboxes__label" for="hateCrime-previous">
                <span class="govuk-visually-hidden">Hate crime: previous</span>
              </label>
          </div>
        </div>`,
      })
    })
  })
})
