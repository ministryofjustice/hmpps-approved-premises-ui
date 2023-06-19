import { PlacementApplicationTask, PlacementType } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/placementApplications'
import { linkTo, sentenceCase } from '../utils'
import { crnCell, tierCell } from '../tableUtils'

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
    html: linkTo(
      paths.placementApplications.review.show,
      { id: task.id },
      {
        text: task.person.name,
        attributes: { 'data-cy-placementApplicationId': task.id, 'data-cy-applicationId': task.applicationId },
      },
    ),
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
