import { Cancellation } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'

export const cancellationSummary = (cancellation: Cancellation): SummaryListWithCard => {
  const rows = [
    cancellationRow('Approved Premises', cancellation.premisesName),
    cancellationRow('Date', cancellation.date),
    cancellationRow('Reason', cancellation.reason.name),
    cancellationRow('Notes', cancellation.notes),
  ]
  return {
    card: {
      title: {
        text: 'Previous match',
      },
    },
    rows,
  }
}

export const cancellationRow = (key: string, value: string): SummaryListItem => {
  return {
    key: {
      text: key,
    },
    value: {
      html: value,
    },
  }
}
