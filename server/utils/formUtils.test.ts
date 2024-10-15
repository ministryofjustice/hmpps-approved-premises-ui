import { DeepMocked, createMock } from '@golevelup/ts-jest'

import type { ErrorMessages } from '@approved-premises/ui'
import {
  convertArrayToCheckboxItems,
  convertArrayToRadioItems,
  convertKeyValuePairToCheckBoxItems,
  convertKeyValuePairToRadioItems,
  convertKeyValuePairsToSummaryListItems,
  convertObjectsToRadioItems,
  convertObjectsToSelectOptions,
  dateFieldValues,
  escape,
  flattenCheckboxInput,
  isStringOrArrayOfStrings,
  placementRequestStatusSelectOptions,
  tierSelectOptions,
  validPostcodeArea,
} from './formUtils'

describe('formUtils', () => {
  describe('dateFieldValues', () => {
    const context = {
      'myField-day': 12,
      'myField-month': 11,
      'myField-year': 2022,
    }
    const fieldName = 'myField'

    let errors: DeepMocked<ErrorMessages>

    beforeEach(() => {
      errors = createMock<ErrorMessages>({
        someOtherField: {
          text: 'Some error message',
        },
        myField: undefined,
      })
    })

    it('returns items with an error class when errors are present for the field', () => {
      errors = createMock<ErrorMessages>({
        myField: {
          text: 'Some error message',
        },
      })

      expect(dateFieldValues(fieldName, context, errors)).toEqual([
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 govuk-input--error',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 govuk-input--error',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })

    it('returns items without an error class when no errors are present for the field', () => {
      expect(dateFieldValues(fieldName, context, errors)).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })

    it('returns items without an error class when no errors are present for the field', () => {
      expect(dateFieldValues(fieldName, context, errors)).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })

    it("returns today's date by default when defaultToToday is true and the context is empty", () => {
      const today = new Date()

      expect(dateFieldValues(fieldName, {}, errors, true)).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: today.getDate(),
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: today.getMonth() + 1,
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: today.getFullYear(),
        },
      ])
    })

    it('returns the data from the context when defaultToToday is true and the context is present', () => {
      expect(dateFieldValues(fieldName, context, errors, true)).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: context['myField-month'],
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: context['myField-year'],
        },
      ])
    })

    it('returns the data from the context when defaultToToday is true and a partial date is given', () => {
      expect(
        dateFieldValues(
          fieldName,
          {
            'myField-day': 12,
          },
          errors,
          true,
        ),
      ).toEqual([
        {
          classes: 'govuk-input--width-2 ',
          name: 'day',
          value: context['myField-day'],
        },
        {
          classes: 'govuk-input--width-2 ',
          name: 'month',
          value: undefined,
        },
        {
          classes: 'govuk-input--width-4 ',
          name: 'year',
          value: undefined,
        },
      ])
    })
  })

  describe('convertObjectsToRadioItems', () => {
    const objects = [
      {
        id: '123',
        name: 'abc',
      },
      {
        id: '345',
        name: 'def',
      },
    ]

    it('converts objects to an array of radio items', () => {
      const result = convertObjectsToRadioItems(objects, 'name', 'id', 'field', {})

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: false,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
        },
      ])
    })

    it('marks objects that are in the context as checked', () => {
      const result = convertObjectsToRadioItems(objects, 'name', 'id', 'field', { field: '123' })

      expect(result).toEqual([
        {
          text: 'abc',
          value: '123',
          checked: true,
        },
        {
          text: 'def',
          value: '345',
          checked: false,
        },
      ])
    })
  })

  describe('convertKeyValuePairToCheckBoxItems', () => {
    const obj = {
      foo: 'Foo',
      bar: 'Bar',
    }

    it('should convert a key value pair to checkbox items', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, [])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should handle an undefined checkedItems value', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, undefined)).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should check the checked item', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, ['foo'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])

      expect(convertKeyValuePairToCheckBoxItems(obj, ['bar'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])

      expect(convertKeyValuePairToCheckBoxItems(obj, ['foo', 'bar'])).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])
    })

    it('should separate the exclusive option', () => {
      expect(convertKeyValuePairToCheckBoxItems(obj, [], true)).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          divider: 'or',
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
          behaviour: 'exclusive',
        },
      ])
    })
  })

  describe('convertKeyValuePairToRadioItems', () => {
    const obj = {
      foo: 'Foo',
      bar: 'Bar',
    }

    it('should convert a key value pair to radio items', () => {
      expect(convertKeyValuePairToRadioItems(obj)).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])
    })

    it('should check the checked item', () => {
      expect(convertKeyValuePairToRadioItems(obj, 'foo')).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: true,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
        },
      ])

      expect(convertKeyValuePairToRadioItems(obj, 'bar')).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: true,
        },
      ])
    })

    it('should handle conditionals', () => {
      const conditionals = {
        foo: {
          html: 'foo',
        },
        bar: {
          html: 'bar',
        },
      }

      expect(convertKeyValuePairToRadioItems(obj, undefined, conditionals)).toEqual([
        {
          value: 'foo',
          text: 'Foo',
          checked: false,
          conditional: {
            html: 'foo',
          },
        },
        {
          value: 'bar',
          text: 'Bar',
          checked: false,
          conditional: {
            html: 'bar',
          },
        },
      ])
    })

    it('should handle hints', () => {
      const hints = {
        foo: {
          text: 'foo',
        },
        bar: {
          html: '<p>bar</p>',
        },
      }

      expect(convertKeyValuePairToRadioItems(obj, undefined, undefined, hints)).toEqual([
        expect.objectContaining({
          hint: {
            text: 'foo',
          },
        }),
        expect.objectContaining({
          hint: { html: '<p>bar</p>' },
        }),
      ])
    })
  })

  describe('convertObjectsToSelectOptions', () => {
    const objects = [
      {
        id: '123',
        name: 'abc',
      },
      {
        id: '345',
        name: 'def',
      },
    ]

    it('converts objects to an array of select options', () => {
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', '', {})

      expect(result).toEqual([
        {
          value: '',
          text: 'Select a keyworker',
          selected: true,
        },
        {
          text: 'abc',
          value: '123',
          selected: false,
        },
        {
          text: 'def',
          value: '345',
          selected: false,
        },
      ])
    })

    it('marks the object that is in the context as selected', () => {
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', '', {
        field: '123',
      })

      expect(result).toEqual([
        {
          value: '',
          text: 'Select a keyworker',
          selected: false,
        },
        {
          text: 'abc',
          value: '123',
          selected: true,
        },
        {
          text: 'def',
          value: '345',
          selected: false,
        },
      ])
    })

    it('accepts a different default value', () => {
      const result = convertObjectsToSelectOptions(objects, 'All workers', 'name', 'id', 'field', 'all', {})

      expect(result).toEqual([
        {
          value: 'all',
          text: 'All workers',
          selected: true,
        },
        {
          text: 'abc',
          value: '123',
          selected: false,
        },
        {
          text: 'def',
          value: '345',
          selected: false,
        },
      ])
    })
  })

  describe('validPostcodeArea', () => {
    it('when passed a postcode area it returns true', () => {
      expect(validPostcodeArea('HR1')).toBe(true)
    })

    it('when passed a valid postcode area with a space after the postcode it returns true', () => {
      expect(validPostcodeArea('HR1 ')).toBe(true)
    })

    it('when passed a lowecase postcode area it returns true', () => {
      expect(validPostcodeArea('hr1')).toBe(true)
    })

    it('when passed a non-postcode string returns false', () => {
      expect(validPostcodeArea('foo')).toBe(false)
    })
  })

  describe('flattenCheckboxInput', () => {
    it('returns the input in an array', () => {
      expect(flattenCheckboxInput('test')).toEqual(['test'])
    })
    it('returns the input if it is already an array', () => {
      expect(flattenCheckboxInput(['test'])).toEqual(['test'])
    })
    it('returns an empty array if the value is falsy', () => {
      expect(flattenCheckboxInput(null)).toEqual([])
    })
  })

  describe('isStringOrArrayOfStrings', () => {
    it('returns true if the input is a string', () => {
      expect(isStringOrArrayOfStrings('test')).toEqual(true)
    })
    it('returns true if the input is an array of strings', () => {
      expect(isStringOrArrayOfStrings(['test', 'test'])).toEqual(true)
    })
    it('returns false if array contains a non-string value ', () => {
      expect(isStringOrArrayOfStrings(['test', 1, 'test'])).toEqual(false)
    })
  })

  describe('escape', () => {
    it('escapes HTML tags', () => {
      expect(escape('<b>Formatted text</b>')).toEqual('&lt;b&gt;Formatted text&lt;/b&gt;')
    })

    it('escapes reserved characters', () => {
      expect(escape('"Quoted text"')).toEqual('&quot;Quoted text&quot;')
    })

    it('returns the empty string when given null', () => {
      expect(escape(null)).toEqual('')
    })
  })

  describe('convertArrayToRadioItems', () => {
    describe('when hints are passed and labels arent', () => {
      it('returns the array as radio items with the value in sentence case', () => {
        expect(convertArrayToRadioItems(['one', 'two'], 'two', {}, { one: { html: 'some hint' } })).toEqual([
          { text: 'One', value: 'one', checked: false, hint: { html: 'some hint' } },
          { text: 'Two', value: 'two', checked: true },
        ])
      })
    })

    describe('when labels are passed', () => {
      it('returns the array as radio items with the value in sentence case', () => {
        expect(
          convertArrayToRadioItems(['one', 'two'], 'two', { one: 'The number one', two: 'The number two' }),
        ).toEqual([
          { text: 'The number one', value: 'one', checked: false },
          { text: 'The number two', value: 'two', checked: true },
        ])
      })
    })
  })

  describe('convertArrayToCheckboxItems', () => {
    it('returns the array as checkbox items with the value in sentence case and the correct conditional', () => {
      expect(convertArrayToCheckboxItems(['one', 'two'], ['one', 'two'])).toEqual([
        { text: 'One', value: 'one', conditional: { html: 'one' } },
        { text: 'Two', value: 'two', conditional: { html: 'two' } },
      ])
    })
  })

  describe('convertKeyValuePairsToSummaryListItems', () => {
    it('returns the key value pairs as summary list items', () => {
      expect(convertKeyValuePairsToSummaryListItems({ itemOne: 'someValue' }, { itemOne: 'First title' })).toEqual([
        {
          key: {
            text: 'First title',
          },
          value: {
            text: 'someValue',
          },
        },
      ])
    })
  })

  describe('tierSelectOptions', () => {
    it('returns a list of tiers as select options', () => {
      expect(tierSelectOptions(undefined)).toEqual([
        { text: 'Please select', value: '', selected: true },
        { text: 'D0', value: 'D0', selected: false },
        { text: 'D1', value: 'D1', selected: false },
        { text: 'D2', value: 'D2', selected: false },
        { text: 'D3', value: 'D3', selected: false },
        { text: 'C0', value: 'C0', selected: false },
        { text: 'C1', value: 'C1', selected: false },
        { text: 'C2', value: 'C2', selected: false },
        { text: 'C3', value: 'C3', selected: false },
        { text: 'B0', value: 'B0', selected: false },
        { text: 'B1', value: 'B1', selected: false },
        { text: 'B2', value: 'B2', selected: false },
        { text: 'B3', value: 'B3', selected: false },
        { text: 'A0', value: 'A0', selected: false },
        { text: 'A1', value: 'A1', selected: false },
        { text: 'A2', value: 'A2', selected: false },
        { text: 'A3', value: 'A3', selected: false },
      ])
    })

    it('return the selected tier if specified', () => {
      expect(tierSelectOptions('C1')).toEqual([
        { text: 'Please select', value: '', selected: false },
        { text: 'D0', value: 'D0', selected: false },
        { text: 'D1', value: 'D1', selected: false },
        { text: 'D2', value: 'D2', selected: false },
        { text: 'D3', value: 'D3', selected: false },
        { text: 'C0', value: 'C0', selected: false },
        { text: 'C1', value: 'C1', selected: true },
        { text: 'C2', value: 'C2', selected: false },
        { text: 'C3', value: 'C3', selected: false },
        { text: 'B0', value: 'B0', selected: false },
        { text: 'B1', value: 'B1', selected: false },
        { text: 'B2', value: 'B2', selected: false },
        { text: 'B3', value: 'B3', selected: false },
        { text: 'A0', value: 'A0', selected: false },
        { text: 'A1', value: 'A1', selected: false },
        { text: 'A2', value: 'A2', selected: false },
        { text: 'A3', value: 'A3', selected: false },
      ])
    })
  })
})

describe('placementRequestStatusSelectOptions', () => {
  it('should return select options for tiers with the all tiers option selected by default', () => {
    expect(placementRequestStatusSelectOptions(null)).toEqual([
      { selected: true, text: 'All statuses', value: '' },
      { selected: false, text: 'Not matched', value: 'notMatched' },
      { selected: false, text: 'Unable to match', value: 'unableToMatch' },
      { selected: false, text: 'Matched', value: 'matched' },
    ])
  })

  it('should return the selected status if provided', () => {
    expect(placementRequestStatusSelectOptions('matched')).toEqual([
      { selected: false, text: 'All statuses', value: '' },
      { selected: false, text: 'Not matched', value: 'notMatched' },
      { selected: false, text: 'Unable to match', value: 'unableToMatch' },
      { selected: true, text: 'Matched', value: 'matched' },
    ])
  })
})
