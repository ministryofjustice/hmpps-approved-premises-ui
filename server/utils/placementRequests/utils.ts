import { PlacementRequest } from '@approved-premises/api'
import { SpaceSearchParametersUi } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { createQueryString, linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import pathsAdmin from '../../paths/admin'
import { placementLength } from '../matchUtils'
import { DateFormats, daysToWeeksAndDays } from '../dateUtils'
import { TabItem } from '../tasks/listTable'

export const mapPlacementRequestToBedSearchParams = ({
  duration,
  expectedArrival,
  location,
}: PlacementRequest): SpaceSearchParametersUi => {
  const daysAndWeeks = daysToWeeksAndDays(duration)
  return {
    durationDays: String(daysAndWeeks.days),
    durationWeeks: String(daysAndWeeks.weeks),
    startDate: expectedArrival,
    postcodeDistrict: location,
    requiredCharacteristics: 'normal',
  }
}

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: PlacementRequest) =>
  linkTo(
    paths.v2Match.placementRequests.search.spaces,
    { id: placementRequest.id },
    { text: 'Search', attributes: { class: 'govuk-button' } },
  )

export const assessmentLink = (placementRequest: PlacementRequest, text: string, hiddenText: string) =>
  linkTo(assessPaths.assessments.show, { id: placementRequest.assessmentId }, { text, hiddenText })

export const requestTypes = [
  { name: 'Parole', value: 'parole' },
  { name: 'Standard release', value: 'standardRelease' },
]

export const withdrawalMessage = (duration: number, expectedArrivalDate: string) =>
  `Request for placement for ${placementLength(Number(duration))} starting on ${DateFormats.isoDateToUIDate(expectedArrivalDate, { format: 'short' })} withdrawn successfully`

export const placementRequestTabItems = (activeTab?: string, apArea?: string, requestType?: string): Array<TabItem> => {
  return [
    {
      text: 'Pending Request for Placement',
      active: activeTab === 'pendingPlacement',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString({ apArea, status: 'pendingPlacement' }, { addQueryPrefix: true })}`,
    },
    {
      text: 'Ready to match',
      active: activeTab === 'notMatched' || activeTab === undefined || activeTab?.length === 0,
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString({ apArea, requestType }, { addQueryPrefix: true })}`,
    },
    {
      text: 'Unable to match',
      active: activeTab === 'unableToMatch',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString({ apArea, requestType, status: 'unableToMatch' }, { addQueryPrefix: true })}`,
    },
    {
      text: 'Matched',
      active: activeTab === 'matched',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString({ apArea, requestType, status: 'matched' }, { addQueryPrefix: true })}`,
    },
    {
      text: 'Search',
      active: activeTab === 'search',
      href: pathsAdmin.admin.cruDashboard.search({}),
    },
  ]
}
