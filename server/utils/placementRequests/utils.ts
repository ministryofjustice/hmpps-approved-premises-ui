import { PlacementRequest } from '@approved-premises/api'
import { BedSearchParametersUi } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'
import paths from '../../paths/match'

export const mapPlacementRequestToBedSearchParams = ({
  duration,
  essentialCriteria,
  expectedArrival,
  location,
  radius,
  person,
  applicationId,
  assessmentId,
}: PlacementRequest): BedSearchParametersUi => ({
  durationDays: duration.toString(),
  startDate: expectedArrival,
  postcodeDistrict: location,
  maxDistanceMiles: radius.toString(),
  crn: person.crn,
  applicationId,
  assessmentId,
  requiredCharacteristics: essentialCriteria,
})

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: PlacementRequest) =>
  linkTo(
    paths.placementRequests.beds.search,
    { id: placementRequest.id },
    { text: 'Search', attributes: { class: 'govuk-button' } },
  )
