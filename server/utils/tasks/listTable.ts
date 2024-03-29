import { isAssessmentTask, isPlacementApplicationTask, isPlacementRequestTask } from './assertions'
import { SortDirection, Task, TaskSortField } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { sortHeader } from '../sortHeader'
import { kebabCase, linkTo, sentenceCase } from '../utils'
import { daysUntilDueCell } from '../tableUtils'

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

const allocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows: Array<TableRow> = []

  tasks.forEach(task => {
    rows.push([
      nameAnchorCell(task),
      daysUntilDueCell(task, 'task--index__warning'),
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
    rows.push([
      nameAnchorCell(task),
      daysUntilDueCell(task, 'task--index__warning'),
      statusCell(task),
      taskTypeCell(task),
      apAreaCell(task),
    ])
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
    sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Allocated to', 'allocatedTo', sortBy, sortDirection, hrefPrefix),
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
    sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
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

const tasksTabItems = (hrefPrefix: string, activeTab = 'allocated'): Array<TabItem> => {
  const [path, query] = hrefPrefix.split('?')
  const urlParams = new URLSearchParams(query)

  const allocatedParams = {
    ...Object.fromEntries(urlParams),
    allocatedFilter: 'allocated',
  } as Record<string, string>
  const { allocatedToUserId: _, ...unallocatedParams } = {
    ...Object.fromEntries(urlParams),
    allocatedFilter: 'unallocated',
  } as Record<string, string>

  const allocatedTabHref = new URLSearchParams(allocatedParams).toString()
  const unallocatedTabHref = new URLSearchParams(unallocatedParams).toString()

  return [
    {
      text: 'Allocated',
      active: activeTab === 'allocated',
      href: `${path}?${allocatedTabHref}`,
    },
    {
      text: 'Unallocated',
      active: activeTab === 'unallocated',
      href: `${path}?${unallocatedTabHref}`,
    },
  ]
}

export {
  allocatedTableRows,
  tasksTableHeader,
  nameAnchorCell,
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
