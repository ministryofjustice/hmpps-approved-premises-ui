import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { preferredApsRow } from './preferredApsRow'
import { placementRequirementsRow } from './placementRequirementsRow'

export const matchingInformationSummary = (placementRequest: Cas1PlacementRequestDetail): SummaryListWithCard => {
  return {
    card: {
      title: {
        text: 'Information for Matching',
      },
    },
    rows: matchingInformationSummaryRows(placementRequest),
  }
}

export const matchingInformationSummaryRows = (
  placementRequest: Cas1PlacementRequestDetail,
): Array<SummaryListItem> => {
  const rows = []

  const preferredAps = preferredApsRow(placementRequest)

  if (preferredAps) {
    rows.push(preferredAps)
  }

  rows.push(placementRequirementsRow(placementRequest, 'essential'))
  rows.push(placementRequirementsRow(placementRequest, 'desirable'))

  if (placementRequest.notes) {
    rows.push({
      key: {
        text: 'Observations from assessor',
      },
      value: {
        text: placementRequest.notes,
      },
    })
  }
  return rows
}
