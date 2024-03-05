import { isAssessmentTask, isPlacementApplicationTask, isPlacementRequestTask } from './assertions'
import { SortDirection, Task, TaskSortField } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import { kebabCase, linkTo, pluralize, sentenceCase } from '../utils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

const daysUntilDueCell = (task: Task): TableCell => {
  const differenceInDays = DateFormats.differenceInBusinessDays(DateFormats.isoToDateObj(task.dueAt), new Date())
  const html =
    differenceInDays === 0 ? '<strong class="task--index__warning">Today</strong>' : formatDaysUntilDueWithWarning(task)
  return {
    html,
    attributes: {
      'data-sort-value': differenceInDays,
    },
  }
}

const statusCell = (task: Task): TableCell => ({
  html: statusBadge(task),
})

const getTaskType = (task: Task): string => {
  let taskType
  if (isPlacementRequestTask(task)) {
    taskType = 'Match request'
  }
  if (isPlacementApplicationTask(task)) {
    taskType = 'Request for placement'
  }
  if (isAssessmentTask(task)) {
    taskType = 'Assessment'
    if (task.createdFromAppeal) {
      taskType += ' (Appealed)'
    }
  }

  return taskType
}

const taskTypeCell = (task: Task): TableCell => ({
  html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
})

const allocationCell = (task: Task): TableCell => ({
  text: task.allocatedToStaffMember?.name,
})

const nameAnchorCell = (task: Task): TableCell => ({
  html: linkTo(paths.tasks.show, taskParams(task), {
    text: task.personName,
    attributes: { 'data-cy-taskId': task.id, 'data-cy-applicationId': task.applicationId },
  }),
})

const apAreaCell = (task: Task): TableCell => ({
  text: task.apArea?.name || 'No area supplied',
})

const statusBadge = (task: Task): string => {
  switch (task.status) {
    case 'complete':
      return `<strong class="govuk-tag">${sentenceCase(task.status)}</strong>`
    case 'not_started':
      return `<strong class="govuk-tag govuk-tag--yellow">${sentenceCase(task.status)}</strong>`
    case 'in_progress':
      return `<strong class="govuk-tag govuk-tag--grey">${sentenceCase(task.status)}</strong>`
    default:
      return ''
  }
}

const formatDaysUntilDueWithWarning = (task: Task): string => {
  const differenceInDays = DateFormats.differenceInBusinessDays(DateFormats.isoToDateObj(task.dueAt), new Date())
  const formattedDifference = pluralize('Day', differenceInDays)

  if (differenceInDays < 0) {
    return `<strong class="task--index__warning">${formattedDifference}<span class="govuk-visually-hidden"> (Overdue by ${pluralize('day', Math.abs(differenceInDays))})</span></strong>`
  }

  if (differenceInDays < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="task--index__warning">${formattedDifference}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }

  return formattedDifference
}

const allocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows: Array<TableRow> = []

  tasks.forEach(task => {
    rows.push([
      nameAnchorCell(task),
      daysUntilDueCell(task),
      allocationCell(task),
      statusCell(task),
      taskTypeCell(task),
      apAreaCell(task),
    ])
  })

  return rows
}

const unallocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  tasks.forEach(task => {
    rows.push([nameAnchorCell(task), daysUntilDueCell(task), statusCell(task), taskTypeCell(task), apAreaCell(task)])
  })

  return rows
}

const tasksTableRows = (tasks: Array<Task>, allocatedFilter: string): Array<TableRow> => {
  const rows: Array<TableRow> =
    allocatedFilter === 'allocated' ? allocatedTableRows(tasks) : unallocatedTableRows(tasks)

  return rows
}

const allocatedTableHeader = (sortBy: TaskSortField, sortDirection: SortDirection, hrefPrefix: string) => {
  return [
    {
      text: 'Person',
    },
    sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Allocated to',
    },
    {
      text: 'Status',
    },
    {
      text: 'Task type',
    },
    {
      text: 'AP area',
    },
  ]
}

const unAllocatedTableHeader = (sortBy: TaskSortField, sortDirection: SortDirection, hrefPrefix: string) => {
  return [
    {
      text: 'Person',
    },
    sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Status',
    },
    {
      text: 'Task type',
    },
    {
      text: 'AP area',
    },
  ]
}

const tasksTableHeader = (
  allocatedFilter: string,
  sortBy: TaskSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
) => {
  return allocatedFilter === 'allocated'
    ? allocatedTableHeader(sortBy, sortDirection, hrefPrefix)
    : unAllocatedTableHeader(sortBy, sortDirection, hrefPrefix)
}

const taskParams = (task: Task) => ({ id: task.id, taskType: kebabCase(task.taskType) })

export type TabItem = {
  text: string
  active: boolean
  href: string
}

const tasksTabItems = (activeTab?: string, apArea?: string): Array<TabItem> => {
  const hrefSuffix = apArea ? `&area=${apArea}` : ''
  const allocatedHref = `${paths.tasks.index({})}?allocatedFilter=allocated${hrefSuffix}`
  const unallocatedHref = `${paths.tasks.index({})}?allocatedFilter=unallocated${hrefSuffix}`

  return [
    {
      text: 'Allocated',
      active: activeTab === 'allocated' || activeTab === undefined || activeTab?.length === 0,
      href: allocatedHref,
    },
    {
      text: 'Unallocated',
      active: activeTab === 'unallocated',
      href: unallocatedHref,
    },
  ]
}

export {
  allocatedTableRows,
  tasksTableHeader,
  nameAnchorCell,
  formatDaysUntilDueWithWarning,
  daysUntilDueCell,
  statusCell,
  taskTypeCell,
  allocationCell,
  statusBadge,
  tasksTableRows,
  unallocatedTableRows,
  taskParams,
  getTaskType,
  tasksTabItems,
}
