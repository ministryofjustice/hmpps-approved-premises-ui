import { PlacementRequest } from '@approved-premises/api'
import { SpaceSearchParametersUi } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { createQueryString, linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import pathsAdmin from '../../paths/admin'
import { filterOutAPTypes, placementLength } from '../match'
import { DateFormats } from '../dateUtils'
import { TabItem } from '../tasks/listTable'

export const mapPlacementRequestToSpaceSearchParams = ({
  duration,
  expectedArrival,
  location,
  essentialCriteria,
  desirableCriteria,
  type,
  gender,
}: PlacementRequest): SpaceSearchParametersUi => {
  return {
    startDate: expectedArrival,
    targetPostcodeDistrict: location,
    durationInDays: duration.toString(),
    requirements: {
      spaceCharacteristics: filterOutAPTypes([...desirableCriteria, ...essentialCriteria]),
      apType: type,
      gender,
    },
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

export const placementRequestTabItems = (
  activeTab?: string,
  cruManagementArea?: string,
  requestType?: string,
): Array<TabItem> => {
  return [
    {
      text: 'Pending Request for Placement',
      active: activeTab === 'pendingPlacement',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          status: 'pendingPlacement',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Ready to match',
      active: activeTab === 'notMatched' || activeTab === undefined || activeTab?.length === 0,
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Unable to match',
      active: activeTab === 'unableToMatch',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
          status: 'unableToMatch',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Matched',
      active: activeTab === 'matched',
      href: `${pathsAdmin.admin.cruDashboard.index({})}${createQueryString(
        {
          cruManagementArea,
          requestType,
          status: 'matched',
        },
        { addQueryPrefix: true },
      )}`,
    },
    {
      text: 'Search',
      active: activeTab === 'search',
      href: pathsAdmin.admin.cruDashboard.search({}),
    },
  ]
}
