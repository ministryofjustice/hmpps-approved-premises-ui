import { roomCharacteristicMap } from '../characteristicsUtils'
import { placementCriteriaLabels } from '../placementCriteriaUtils'

export const spaceSearchCriteriaApLevelLabels = {
  acceptsSexOffenders: 'Sexual offences against adults',
  acceptsChildSexOffenders: 'Sexual offences against children',
  acceptsNonSexualChildOffenders: 'Non-sexual offences against children',
  isCatered: 'Catered',
} as const

export const spaceSearchResultsCharacteristicsLabels = {
  ...spaceSearchCriteriaApLevelLabels,
  ...roomCharacteristicMap,
  isSuitableForVulnerable: placementCriteriaLabels.isSuitableForVulnerable,
} as const
