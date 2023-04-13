import { PlacementRequest } from '@approved-premises/api'
import { SummaryListItem, SummaryListWithCard } from '@approved-premises/ui'
import { sentenceCase } from '../utils'
import { mapSearchParamCharacteristicsForUi } from '../matchUtils'

export const matchingInformationSummary = (placementRequest: PlacementRequest): SummaryListWithCard => {
  return {
    card: {
      title: {
        text: 'Information for Matching',
      },
    },
    rows: [
      placementRequirementsRow(placementRequest, 'essential'),
      placementRequirementsRow(placementRequest, 'desirable'),
    ],
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
