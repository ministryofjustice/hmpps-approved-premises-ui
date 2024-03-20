import { cell, heading, radioMatrixTable, row } from './radioMatrixTable'

jest.mock('./placementCriteriaUtils', () => {
  return {
    placementCriteriaLabels: {
      test: 'Test',
    },
  }
})

describe('radioMatrixTable', () => {
  describe('cell', () => {
    it('returns the markup given the name and preference', () => {
      expect(cell('name', 'preference')).toMatchStringIgnoringWhitespace(`<td class="govuk-table__cell">
        <div class="govuk-radios" data-module="govuk-radios">
            <div class="govuk-radios__item">
              <input class="govuk-radios__input" id="name-preference" name="name" type="radio" value="preference" >
              <label class="govuk-label govuk-radios__label" for="name-preference"><span class="govuk-visually-hidden">Name preference</span></label>
            </div>
          </td>`)
    })

    it('if passed a check parameter it adds the "checked" tag', () => {
      expect(cell('name', 'preference', true)).toMatchStringIgnoringWhitespace(`<td class="govuk-table__cell">
        <div class="govuk-radios" data-module="govuk-radios">
            <div class="govuk-radios__item">
              <input class="govuk-radios__input" id="name-preference" name="name" type="radio" value="preference" checked >
              <label class="govuk-label govuk-radios__label" for="name-preference"><span class="govuk-visually-hidden">Name preference</span></label>
            </div>
          </td>`)
    })
  })

  describe('row', () => {
    it('returns the markup given the name and preferences', () => {
      const rowName = 'test'
      const options = ['foo', 'bar']
      const selectedOption = 'foo'
      expect(row(rowName, options, selectedOption)).toMatchStringIgnoringWhitespace(`<tr>
      <th class="govuk-table__cell govuk-!-font-weight-regular" scope="row">Test</td>
        ${cell(rowName, options[0], true)}
        ${cell(rowName, options[1], false)}
  </tr>`)
    })
  })

  describe('headings', () => {
    it('returns the table column headings', () => {
      expect(heading(['headingOne', 'headingTwo'])).toMatchStringIgnoringWhitespace(`<thead class="govuk-table__head">
      <tr class="govuk-table__row">
      <th class="govuk-table__header" scope="col">headingOne</th><th class="govuk-table__header" scope="col">headingTwo</th>
      </tr>
      </thead>`)
    })
  })

  describe('radioMatrixTable', () => {
    it('returns the markup given the name and preferences', () => {
      const columnHeadings = ['heading one', 'heading two']
      const values = ['valueOne', 'valueTwo']
      const preferences = ['preferenceOne', 'preferenceTwo']
      const body = {
        valueOne: 'preferenceTwo',
      }
      expect(radioMatrixTable(columnHeadings, values, preferences, body)).toMatchStringIgnoringWhitespace(
        `<table class="govuk-table">
        ${heading(columnHeadings)}
        ${row(values[0], preferences, 'preferenceTwo')}
        ${row(values[1], preferences, '')}
      </table>`,
      )
    })
  })
})
