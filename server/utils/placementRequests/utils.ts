import { Cas1PlacementRequestDetail } from '@approved-premises/api'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { placementLength } from '../match'
import { DateFormats } from '../dateUtils'
import { personKeyDetails } from '../placements'

export const formatReleaseType = (placementRequest: Cas1PlacementRequestDetail) =>
  allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: Cas1PlacementRequestDetail) =>
  linkTo(paths.v2Match.placementRequests.search.spaces({ placementRequestId: placementRequest.id }), {
    text: 'Search',
    attributes: { class: 'govuk-button' },
  })

export const assessmentLink = (placementRequest: Cas1PlacementRequestDetail, text: string, hiddenText: string) =>
  linkTo(assessPaths.assessments.show({ id: placementRequest.assessmentId }), { text, hiddenText })

export const requestTypes = [
  { name: 'Parole', value: 'parole' },
  { name: 'Standard release', value: 'standardRelease' },
]

export const withdrawalMessage = (duration: number, expectedArrivalDate: string) =>
  `Request for placement for ${placementLength(Number(duration))} starting on ${DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })} withdrawn successfully`

export const placementRequestKeyDetails = (placementRequest: Cas1PlacementRequestDetail) =>
  personKeyDetails(placementRequest.person, placementRequest.risks?.tier?.value?.level)
