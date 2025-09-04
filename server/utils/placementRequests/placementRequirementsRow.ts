import { Cas1PlacementRequestDetail } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'

import { characteristicsBulletList } from '../characteristicsUtils'
import { summaryListItem } from '../formUtils'

export const placementRequirementsRow = (placementRequest: Cas1PlacementRequestDetail): SummaryListItem =>
  summaryListItem('Criteria', characteristicsBulletList(placementRequest.essentialCriteria), 'html')
