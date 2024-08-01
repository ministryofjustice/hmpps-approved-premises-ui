import { PlacementRequest, PlacementRequestDetail } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { sentenceCase } from '../utils'
import { mapSearchParamCharacteristicsForUi } from '../matchUtils'

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

export const placementRequirementsRow = (
  placementRequest: PlacementRequest,
  type: 'desirable' | 'essential',
): SummaryListItem => {
  const criteria = type === 'essential' ? placementRequest.essentialCriteria : placementRequest.desirableCriteria
  return {
    key: {
      text: `${sentenceCase(type)} Criteria`,
    },
    value: {
      html: mapSearchParamCharacteristicsForUi(criteria),
    },
  }
}
