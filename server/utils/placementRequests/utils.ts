import { PlacementRequest } from '@approved-premises/api'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { mapPlacementRequestToBedSearchParams } from './table'
import { createQueryString } from '../utils'
import paths from '../../paths/match'

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: PlacementRequest) =>
  `<a class="govuk-button" href="${paths.beds.search({})}?${createQueryString(
    mapPlacementRequestToBedSearchParams(placementRequest),
  )}">Search</a>`
