import { DateFormats } from './dateUtils'

import { offenceRadioButton, offenceTableRows } from './offenceUtils'

import { activeOffenceFactory } from '../testutils/factories'

describe('offenceUtils', () => {
  describe('offenceRadioButton', () => {
    it('returns a radio button for the offence', () => {
      const offence = activeOffenceFactory.build({ offenceId: '123', offenceDescription: 'Description goes here' })

      expect(offenceRadioButton(offence)).toMatchStringIgnoringWhitespace(`
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="123" name="offenceId" type="radio" value="123" />
        <label class="govuk-label govuk-radios__label" for="123">
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
            text: offences[0].offenceId,
          },
          {
            text: offences[0].offenceDescription,
          },
          {
            text: DateFormats.isoDateToUIDate(offences[0].offenceDate),
          },
          {
            text: String(offences[0].convictionId),
          },
        ],
        [
          {
            html: offenceRadioButton(offences[1]),
          },
          {
            text: offences[1].offenceId,
          },
          {
            text: offences[1].offenceDescription,
          },
          {
            text: DateFormats.isoDateToUIDate(offences[1].offenceDate),
          },
          {
            text: String(offences[1].convictionId),
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
            text: offence.offenceId,
          },
          {
            text: offence.offenceDescription,
          },
          {
            text: 'No offence date available',
          },
          {
            text: String(offence.convictionId),
          },
        ],
      ])
    })
  })
})
