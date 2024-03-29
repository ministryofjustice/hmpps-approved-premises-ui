import { PlacementRequest } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { sentenceCase } from '../utils'
import { assessmentLink } from './utils'
import { applicationLink } from './applicationLink'

export const documentSummary = (placementRequest: PlacementRequest): SummaryListWithCard => {
  return {
    card: {
      title: {
        text: 'Documents',
      },
    },
    rows: [documentSummaryRow(placementRequest, 'application'), documentSummaryRow(placementRequest, 'assessment')],
  }
}

export const documentSummaryRow = (
  placementRequest: PlacementRequest,
  type: 'assessment' | 'application',
): SummaryListItem => {
  const linkText = `View document`
  const hiddenText = `(${type})`
  const link =
    type === 'application'
      ? applicationLink(placementRequest, linkText, hiddenText)
      : assessmentLink(placementRequest, linkText, hiddenText)

  return {
    key: {
      text: sentenceCase(type),
    },
    value: {
      html: link,
    },
  }
}
