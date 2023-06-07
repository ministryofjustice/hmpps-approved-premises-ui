import { add } from 'date-fns'
import { PlacementRequestTask } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/match'
import { DateFormats } from '../dateUtils'
import { linkTo } from '../utils'
import { tierBadge } from '../personUtils'
import { allReleaseTypes } from '../applications/releaseTypeUtils'

export const DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE = 7

export const tableRows = (tasks: Array<PlacementRequestTask>): Array<TableRow> => {
  return tasks.map((task: PlacementRequestTask) => {
    return [
      nameCell(task),
      crnCell(task),
      tierCell(task),
      expectedArrivalDateCell(task),
      dueDateCell(task, DIFFERENCE_IN_DAYS_BETWEEN_DUE_DATE_AND_ARRIVAL_DATE),
      releaseTypeCell(task),
    ]
  })
}

export const crnCell = (task: PlacementRequestTask): TableCell => ({ text: task.person.crn })

export const dueDateCell = (task: PlacementRequestTask, differenceBetweenDueDateAndArrivalDate: number): TableCell => {
  const dateAsObject = DateFormats.isoToDateObj(task.expectedArrival)

  return {
    text: DateFormats.differenceInDays(
      dateAsObject,
      add(dateAsObject, { days: differenceBetweenDueDateAndArrivalDate }),
    ).ui,
  }
}

export const expectedArrivalDateCell = (task: PlacementRequestTask): TableCell => ({
  text: DateFormats.isoDateToUIDate(task.expectedArrival),
})

export const nameCell = (task: PlacementRequestTask): TableCell => {
  return {
    html: linkTo(
      paths.placementRequests.show,
      { id: task.id },
      { text: task.person.name, attributes: { 'data-cy-placementRequestId': task.id } },
    ),
  }
}

export const tierCell = (task: PlacementRequestTask) => {
  return {
    html: tierBadge(task.risks.tier?.value?.level),
  }
}

export const releaseTypeCell = (task: PlacementRequestTask) => {
  return {
    text: allReleaseTypes[task.releaseType],
  }
}
