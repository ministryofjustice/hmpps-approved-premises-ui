import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'
import { sentenceCase } from '../utils'

import { characteristicsBulletList } from '../characteristicsUtils'

export const placementRequirementsRow = (
  placementRequest: Cas1PlacementRequestDetail,
  type: 'desirable' | 'essential',
): SummaryListItem => {
  const criteria = type === 'essential' ? placementRequest.essentialCriteria : placementRequest.desirableCriteria
  return {
    key: {
      text: `${sentenceCase(type)} Criteria`,
    },
    value: {
      html: characteristicsBulletList(criteria),
    },
  }
}
