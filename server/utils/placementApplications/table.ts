import { PlacementApplicationTask, PlacementType, SortDirection, TaskSortField } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/placementApplications'
import { linkTo, sentenceCase } from '../utils'
import { crnCell, tierCell } from '../tableUtils'
import { sortHeader } from '../sortHeader'

export const placementApplicationsTable = (
  placementApplications: Array<PlacementApplicationTask>,
  sortBy: TaskSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
) => {
  return {
    firstCellIsHeader: true,
    head: [
      sortHeader<TaskSortField>('Name', 'person', sortBy, sortDirection, hrefPrefix),
      {
        text: 'CRN',
      },
      {
        text: 'Tier',
      },
      {
        text: 'Type of request',
      },
      {
        text: 'Status',
      },
    ],
    rows: tableRows(placementApplications),
  }
}

const placementTypes: Record<PlacementType, string> = {
  rotl: 'ROTL',
  release_following_decision: 'Release Following Decision',
  additional_placement: 'Additional Placement',
}

export const tableRows = (tasks: Array<PlacementApplicationTask>): Array<TableRow> => {
  return tasks.map((task: PlacementApplicationTask) => {
    return [nameCell(task), crnCell(task), tierCell(task), placementTypeCell(task), statusCell(task)]
  })
}

export const nameCell = (task: PlacementApplicationTask): TableCell => {
  return {
    html: linkTo(paths.placementApplications.review.show({ id: task.id }), {
      text: task.personName,
      attributes: { 'data-cy-placementApplicationId': task.id, 'data-cy-applicationId': task.applicationId },
    }),
  }
}

export const placementTypeCell = (task: PlacementApplicationTask) => {
  return {
    text: placementTypes[task.placementType],
  }
}

export const statusCell = (task: PlacementApplicationTask) => {
  return {
    html: `<strong class="govuk-tag">${sentenceCase(task.status)}</strong>`,
  }
}
