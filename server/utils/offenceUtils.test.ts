import { DateFormats } from './dateUtils'

import { offenceRadioButton, offenceRadioItems, offenceTableRows } from './offenceUtils'

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
            text: offences[0].offenceDescription,
          },
          {
            text: offences[0].deliusEventNumber,
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
            text: offences[1].deliusEventNumber,
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
            text: offence.deliusEventNumber,
          },
          {
            text: 'No offence date available',
          },
        ],
      ])
    })
  })

  describe('offenceRadioItems', () => {
    it('Returns radio item options', () => {
      const offence1 = activeOffenceFactory.build()
      const offence2 = activeOffenceFactory.build()

      expect(offenceRadioItems([offence1, offence2], offence2.deliusEventNumber)).toEqual([
        {
          html: `${offence1.offenceDescription}<br /><span class="govuk-hint">(Delius event number: ${offence1.deliusEventNumber})</span>`,
          value: offence1.deliusEventNumber,
          checked: false,
        },
        {
          html: `${offence2.offenceDescription}<br /><span class="govuk-hint">(Delius event number: ${offence2.deliusEventNumber})</span>`,
          value: offence2.deliusEventNumber,
          checked: true,
        },
      ])
    })
  })
})
