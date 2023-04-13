import { PlacementRequest } from '@approved-premises/api'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]
