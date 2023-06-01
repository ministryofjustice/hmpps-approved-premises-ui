import { add } from 'date-fns'
import { PlacementRequest } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/match'
import { DateFormats } from '../dateUtils'
import { linkTo } from '../utils'
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
    html: linkTo(
      paths.placementRequests.show,
      { id: placementRequest.id },
      { text: placementRequest.person.name, attributes: { 'data-cy-placementRequestId': placementRequest.id } },
    ),
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
