import { ActiveOffence } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { DateFormats } from './dateUtils'
import { escape } from './formUtils'

const offenceTableRows = (offences: Array<ActiveOffence>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  offences.forEach(offence => {
    const offenceDate = offence?.offenceDate
      ? DateFormats.isoDateToUIDate(offence.offenceDate)
      : 'No offence date available'

    rows.push([
      {
        html: offenceRadioButton(offence),
      },
      {
        text: offence.offenceDescription,
      },
      {
        text: offenceDate,
      },
    ])
  })

  return rows
}

const offenceRadioButton = (offence: ActiveOffence) => {
  return `
  <div class="govuk-radios__item">
    <input class="govuk-radios__input" id="${offence.convictionId}" name="offences" type="radio" value="[${escape(
      JSON.stringify(offence),
    )}]" />
    <label class="govuk-label govuk-radios__label" for="${offence.convictionId}">
      <span class="govuk-visually-hidden">
        Select ${offence.offenceDescription} as index offence
      </span>
    </label>
  </div>
  `
}

export { offenceTableRows, offenceRadioButton }
