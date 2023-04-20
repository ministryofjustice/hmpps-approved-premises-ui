import { PlacementRequest } from '@approved-premises/api'
import { BedSearchParametersUi } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'

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
  durationWeeks: duration.toString(),
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

export const applicationLink = (placementRequest: PlacementRequest, text: string, hiddenText: string) =>
  linkTo(applyPaths.applications.show, { id: placementRequest.applicationId }, { text, hiddenText })

export const assessmentLink = (placementRequest: PlacementRequest, text: string, hiddenText: string) =>
  linkTo(assessPaths.assessments.show, { id: placementRequest.assessmentId }, { text, hiddenText })
