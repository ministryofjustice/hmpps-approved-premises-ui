import { Cas1PlacementRequestDetail, Cas1SpaceBookingSummary } from '@approved-premises/api'
import { RadioItemButton } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'

import paths from '../../paths/match'
import managePaths from '../../paths/manage'
import assessPaths from '../../paths/assess'
import { DateFormats } from '../dateUtils'
import { personKeyDetails } from '../applications/helpers'
import { placementNameWithStatus } from './placementSummaryList'

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
  `Request for placement for ${DateFormats.formatDuration(duration)} starting on ${DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })} withdrawn successfully`

export const placementRequestKeyDetails = (placementRequest: Cas1PlacementRequestDetail) =>
  personKeyDetails(placementRequest.person, placementRequest.risks?.tier?.value?.level)

export const placementRadioItems = (
  placements: Array<Cas1SpaceBookingSummary>,
  selected?: Cas1SpaceBookingSummary['id'],
): Array<RadioItemButton> =>
  placements
    .sort((a, b) => a.expectedArrivalDate.localeCompare(b.expectedArrivalDate))
    .map(placement => ({
      html: placementNameWithStatus(placement),
      value: placement.id,
      hint: {
        html: linkTo(
          managePaths.premises.placements.show({ premisesId: placement.premises.id, placementId: placement.id }),
          { text: 'See placement details (opens in a new tab)', attributes: { target: '_blank' } },
        ),
      },
      checked: placement.id === selected || undefined,
    }))
