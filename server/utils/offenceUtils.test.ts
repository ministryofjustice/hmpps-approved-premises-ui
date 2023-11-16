import { DateFormats } from './dateUtils'

import { offenceRadioButton, offenceTableRows, parseOffence } from './offenceUtils'
import { escape } from './formUtils'

import { activeOffenceFactory } from '../testutils/factories'

describe('offenceUtils', () => {
  describe('offenceRadioButton', () => {
    it('returns a radio button for the offence', () => {
      const offence = activeOffenceFactory.build({ convictionId: 123, offenceDescription: 'Description goes here' })

      expect(offenceRadioButton(offence)).toMatchStringIgnoringWhitespace(`
      <div class="govuk-radios__item">
      <input class="govuk-radios__input" id="${offence.convictionId}" name="offences" type="radio" value="[${escape(
        JSON.stringify(offence),
      )}]" />
      <label class="govuk-label govuk-radios__label" for="${offence.convictionId}">
        <span class="govuk-visually-hidden">
          Select Description goes here as index offence
        </span>
      </label>
    </div>
      `)
    })
  })

  describe('offenceTableRows', () => {
    it('returns table rows for the index offences', () => {
      const offences = activeOffenceFactory.buildList(2)

      expect(offenceTableRows(offences)).toEqual([
        [
          {
            html: offenceRadioButton(offences[0]),
          },
          {
            text: offences[0].offenceDescription,
          },
          {
            text: DateFormats.isoDateToUIDate(offences[0].offenceDate),
          },
        ],
        [
          {
            html: offenceRadioButton(offences[1]),
          },
          {
            text: offences[1].offenceDescription,
          },
          {
            text: DateFormats.isoDateToUIDate(offences[1].offenceDate),
          },
        ],
      ])
    })

    it('returns table rows for the index offences when the offenceDate is missing', () => {
      const offence = activeOffenceFactory.build({ offenceDate: undefined })

      expect(offenceTableRows([offence])).toEqual([
        [
          {
            html: offenceRadioButton(offence),
          },
          {
            text: offence.offenceDescription,
          },
          {
            text: 'No offence date available',
          },
        ],
      ])
    })
  })

  describe('parseOffence', () => {
    it('should parse an array of offences', () => {
      const offences = activeOffenceFactory.buildList(2)

      expect(parseOffence(JSON.stringify(offences))).toEqual(offences)
    })

    it('should return null if the offences are not valid', () => {
      expect(parseOffence('[]')).toEqual([])
      expect(parseOffence('[{"foo": "bar"}]')).toEqual([])
      expect(parseOffence('invalid json')).toEqual([])
    })
  })
})
