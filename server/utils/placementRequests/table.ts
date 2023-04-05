import { add } from 'date-fns'
import { PlacementCriteria, PlacementRequest } from '../../@types/shared'
import { BedSearchParametersUi, TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/match'
import { DateFormats } from '../dateUtils'
import { nameCell } from '../tableUtils'
import { createQueryString, sentenceCase } from '../utils'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (placementRequests: Array<PlacementRequest>): Array<TableRow> => {
  return placementRequests.map((placementRequest: PlacementRequest) => {
    return [
      nameCell(placementRequest),
      crnCell(placementRequest),
      dueDateCell(placementRequest, DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE),
      expectedArrivalDateCell(placementRequest),
      locationCell(placementRequest),
      essentialPlacementCriteriaCell(placementRequest),
      desirablePlacementCriteriaCell(placementRequest),
      linkCell(placementRequest),
    ]
  })
}

const crnCell = (placementRequest: PlacementRequest): TableCell => ({ text: placementRequest.person.crn })

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

export const placementCriteriaClasses = `"govuk-!-padding-top-0 govuk-!-margin-top-0 govuk-body-s"`

export const essentialPlacementCriteriaCell = (placementRequest: PlacementRequest): TableCell => ({
  html: `<ul class=${placementCriteriaClasses}>${placementNeedsListItems(placementRequest.essentialCriteria)}</ul>`,
})

export const desirablePlacementCriteriaCell = (placementRequest: PlacementRequest): TableCell => ({
  html: `<ul class=${placementCriteriaClasses}>${placementNeedsListItems(placementRequest.desirableCriteria)}</ul>`,
})

export const placementNeedsListItems = (placementNeeds: Array<PlacementCriteria>): string =>
  placementNeeds.map(placementNeed => `<li>${sentenceCase(placementNeed)}</li>`).join('')

export const locationCell = (placementRequest: PlacementRequest): TableCell => ({ text: placementRequest.location })

export const mentalHealthSupportCell = (placementRequest: PlacementRequest): TableCell => ({
  text: placementRequest.mentalHealthSupport ? 'Yes' : 'No',
})

export const linkCell = (placementRequest: PlacementRequest): TableCell => {
  return {
    html: `<a data-cy-placementRequestId="${placementRequest.id}" href="${paths.beds.search({})}?${createQueryString(
      mapPlacementRequestToBedSearchParams(placementRequest),
    )}">Find bed</a>`,
  }
}

const mapPlacementRequestToBedSearchParams = ({
  duration,
  essentialCriteria,
  expectedArrival,
  location,
  radius,
  person,
  applicationId,
  assessmentId,
}: PlacementRequest): BedSearchParametersUi & {
  [key: string]: unknown
  crn: string
  applicationId: string
  assessmentId: string
} => ({
  durationDays: duration.toString(),
  startDate: expectedArrival,
  postcodeDistrict: location,
  maxDistanceMiles: radius.toString(),
  crn: person.crn,
  applicationId,
  assessmentId,
  requiredPremisesCharacteristics: essentialCriteria,
  requiredRoomCharacteristics: essentialCriteria,
})
