import { PlacementRequestDetail } from '@approved-premises/api'
import { SummaryListWithCard } from '@approved-premises/ui'
import { preferredApsRow } from './preferredApsRow'
import { placementRequirementsRow } from './placementRequirementsRow'

export const matchingInformationSummary = (placementRequest: PlacementRequestDetail): SummaryListWithCard => {
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

  return {
    card: {
      title: {
        text: 'Information for Matching',
      },
    },
    rows,
  }
}
