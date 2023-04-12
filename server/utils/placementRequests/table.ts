import { add } from 'date-fns'
import { PlacementRequest } from '../../@types/shared'
import { BedSearchParametersUi, TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/match'
import { DateFormats } from '../dateUtils'
import { createQueryString } from '../utils'
import { tierBadge } from '../personUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (placementRequests: Array<PlacementRequest>): Array<TableRow> => {
  return placementRequests.map((placementRequest: PlacementRequest) => {
    return [
      nameCell(placementRequest),
      crnCell(placementRequest),
      tierCell(placementRequest),
      expectedArrivalDateCell(placementRequest),
      dueDateCell(placementRequest, DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE),
      releaseTypeCell(placementRequest),
    ]
  })
}

export const crnCell = (placementRequest: PlacementRequest): TableCell => ({ text: placementRequest.person.crn })

export const dueDateCell = (
  placementRequest: PlacementRequest,
  differenceBetweenDueDateAndArrivalDate: number,
): TableCell => {
  const dateAsObject = DateFormats.isoToDateObj(placementRequest.expectedArrival)

  return {
    text: DateFormats.differenceInDays(
      dateAsObject,
      add(dateAsObject, { days: differenceBetweenDueDateAndArrivalDate }),
    ).ui,
  }
}

export const expectedArrivalDateCell = (placementRequest: PlacementRequest): TableCell => ({
  text: DateFormats.isoDateToUIDate(placementRequest.expectedArrival),
})

export const nameCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    html: `<a data-cy-placementRequestId="${placementRequest.id}" href="${paths.beds.search({})}?${createQueryString(
      mapPlacementRequestToBedSearchParams(placementRequest),
    )}">${placementRequest.person.name}</a>`,
  }
}

export const tierCell = (placementRequest: PlacementRequest) => {
  return {
    html: tierBadge(placementRequest.risks.tier?.value?.level),
  }
}

export const releaseTypeCell = (placementRequest: PlacementRequest) => {
  return {
    text: allReleaseTypes[placementRequest.releaseType],
  }
}

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
