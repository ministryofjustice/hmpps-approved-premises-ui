import { UserSummary } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import { htmlCell, textCell } from '../tableUtils'

export const keyworkersTableHead: TableRow = [
  textCell('Name'),
  textCell('Email'),
  {
    ...textCell('Actions'),
    classes: 'table__column--collapse',
  },
]

export const keyworkersTableRows = (availableKeyworkers: Array<UserSummary>): Array<TableRow> =>
  availableKeyworkers.map(user => [
    textCell(user.name),
    textCell(user.emailAddress),
    {
      ...htmlCell(
        `<button class="govuk-button govuk-button--secondary govuk-!-margin-0" type="submit" name="keyworker" value="${user.id}">Assign keyworker</button>`,
      ),
      classes: 'table__column--collapse',
    },
  ])
