import { PlacementRequest } from '@approved-premises/api'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { placementLength } from '../match'
import { DateFormats } from '../dateUtils'

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: PlacementRequest) =>
  linkTo(paths.v2Match.placementRequests.search.spaces({ id: placementRequest.id }), {
    text: 'Search',
    attributes: { class: 'govuk-button' },
  })

export const assessmentLink = (placementRequest: PlacementRequest, text: string, hiddenText: string) =>
  linkTo(assessPaths.assessments.show({ id: placementRequest.assessmentId }), { text, hiddenText })

export const requestTypes = [
  { name: 'Parole', value: 'parole' },
  { name: 'Standard release', value: 'standardRelease' },
]

export const withdrawalMessage = (duration: number, expectedArrivalDate: string) =>
  `Request for placement for ${placementLength(Number(duration))} starting on ${DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })} withdrawn successfully`
