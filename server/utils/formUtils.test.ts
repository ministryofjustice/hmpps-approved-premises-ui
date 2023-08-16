import { createMock } from '@golevelup/ts-jest'

import type { ErrorMessages } from '@approved-premises/ui'
import {
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
  tierSelectOptions,
  validPostcodeArea,
} from './formUtils'

describe('formUtils', () => {
  describe('dateFieldValues', () => {
    it('returns items with an error class when errors are present for the field', () => {
      const errors = createMock<ErrorMessages>({
        myField: {
          text: 'Some error message',
        },
      })
      const context = {
        'myField-day': 12,
        'myField-month': 11,
        'myField-year': 2022,
      }
      const fieldName = 'myField'

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
      const errors = createMock<ErrorMessages>({
        someOtherField: {
          text: 'Some error message',
        },
        myField: undefined,
      })
      const context = {
        'myField-day': 12,
        'myField-month': 11,
        'myField-year': 2022,
      }
      const fieldName = 'myField'

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
  })

  describe('convertKeyValuePairToRadioItems', () => {
    const obj = {
      foo: 'Foo',
      bar: 'Bar',
    }

    it('should convert a key value pair to radio items', () => {
      expect(convertKeyValuePairToRadioItems(obj, '')).toEqual([
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
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', {})

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
      const result = convertObjectsToSelectOptions(objects, 'Select a keyworker', 'name', 'id', 'field', {
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
  })

  describe('validPostcodeArea', () => {
    it('when passed a postcode area it returns true', () => {
      expect(validPostcodeArea('HR1')).toBe(true)
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
    it('returns the array as radio items with the value in sentence case', () => {
      expect(convertArrayToRadioItems(['one', 'two'], 'two')).toEqual([
        { text: 'One', value: 'one', checked: false },
        { text: 'Two', value: 'two', checked: true },
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
