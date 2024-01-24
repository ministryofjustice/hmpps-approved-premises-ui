import { PlacementRequest } from '@approved-premises/api'
import { BedSearchParametersUi } from '@approved-premises/ui'
import { allReleaseTypes } from '../applications/releaseTypeUtils'
import { linkTo } from '../utils'

import paths from '../../paths/match'
import assessPaths from '../../paths/assess'
import { daysToWeeksAndDays } from '../assessments/dateUtils'

export const mapPlacementRequestToBedSearchParams = ({
  duration,
  essentialCriteria,
  desirableCriteria,
  expectedArrival,
  location,
  radius,
  person,
  applicationId,
  assessmentId,
}: PlacementRequest): BedSearchParametersUi => {
  const daysAndWeeks = daysToWeeksAndDays(duration)
  return {
    durationDays: String(daysAndWeeks.days),
    durationWeeks: String(daysAndWeeks.weeks),
    startDate: expectedArrival,
    postcodeDistrict: location,
    maxDistanceMiles: radius.toString(),
    crn: person.crn,
    applicationId,
    assessmentId,
    requiredCharacteristics: [...essentialCriteria, ...desirableCriteria],
  }
}

export const formatReleaseType = (placementRequest: PlacementRequest) => allReleaseTypes[placementRequest.releaseType]

export const searchButton = (placementRequest: PlacementRequest) =>
  linkTo(
    paths.placementRequests.beds.search,
    { id: placementRequest.id },
    { text: 'Search', attributes: { class: 'govuk-button' } },
  )

export const assessmentLink = (placementRequest: PlacementRequest, text: string, hiddenText: string) =>
  linkTo(assessPaths.assessments.show, { id: placementRequest.assessmentId }, { text, hiddenText })

export const requestTypes = [
  { name: 'Parole', value: 'parole' },
  { name: 'Standard release', value: 'standardRelease' },
]
