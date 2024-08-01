import { PlacementRequest } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'
import { mapSearchParamCharacteristicsForUi } from '../match/mapSearchParamCharacteristicsForUi'
import { sentenceCase } from '../utils'

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
