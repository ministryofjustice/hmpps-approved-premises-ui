import { isAssessmentTask, isPlacementApplicationTask } from './assertions'
import {
  AssessmentDecision,
  PlacementApplicationDecision,
  SortDirection,
  Task,
  TaskSortField,
} from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { sortHeader } from '../sortHeader'
import { kebabCase, linkTo } from '../utils'
import { daysUntilDueCell } from '../tableUtils'
import { DateFormats } from '../dateUtils'

import { TaskStatusTag } from './statusTag'
import { displayName } from '../personUtils'

const statusCell = (task: Task): TableCell => ({
  html: new TaskStatusTag(task.status).html(),
})

const getTaskType = (task: Task): string => {
  let taskType
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

const assessmentDecisionTranslations: Record<AssessmentDecision, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const placementApplicationDecisionTranslations: Record<PlacementApplicationDecision, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdraw: 'Withdraw',
  withdrawn_by_pp: 'Withdrawn by probation practitioner',
}

const getAssessmentDecisionOutcome = (outcome: AssessmentDecision): string => {
  return assessmentDecisionTranslations[outcome]
}

const getPlacementApplicationDecisionOutcome = (outcome: PlacementApplicationDecision): string => {
  return placementApplicationDecisionTranslations[outcome]
}

export const getDecisionOutcome = (task: Task): string => {
  if (isPlacementApplicationTask(task)) {
    return getPlacementApplicationDecisionOutcome(task.outcome)
  }
  if (isAssessmentTask(task)) {
    return getAssessmentDecisionOutcome(task.outcome)
  }

  return ''
}

const taskTypeCell = (task: Task): TableCell => ({
  html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
})

const arrivalDateCell = (task: Task): TableCell => ({
  text: task.expectedArrivalDate ? DateFormats.isoDateToUIDate(task.expectedArrivalDate, { format: 'short' }) : '',
})

const allocationCell = (task: Task): TableCell => ({
  text: task.allocatedToStaffMember?.name,
})

const nameAnchorCell = (task: Task): TableCell => ({
  html: linkTo(paths.tasks.show(taskParams(task)), {
    text: displayName(task.personSummary, { showCrn: true }),
    attributes: { 'data-cy-taskId': task.id, 'data-cy-applicationId': task.applicationId },
  }),
})

const apAreaCell = (task: Task): TableCell => ({
  text: task.apArea?.name || 'No area supplied',
})

const allocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows: Array<TableRow> = []
  tasks.forEach(task => {
    rows.push([
      nameAnchorCell(task),
      daysUntilDueCell(task, 'task--index__warning'),
      arrivalDateCell(task),
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
      arrivalDateCell(task),
      statusCell(task),
      taskTypeCell(task),
      apAreaCell(task),
    ])
  })

  return rows
}

export const completedAtDateCell = (task: Task): TableCell => ({
  text: task.outcomeRecordedAt ? DateFormats.isoDateTimeToUIDateTime(task.outcomeRecordedAt) : '',
})

export const completedByCell = (task: Task): TableCell => ({
  text: task.allocatedToStaffMember?.name || '',
})

export const decisionCell = (task: Task): TableCell => ({
  text: getDecisionOutcome(task),
})

const completedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  tasks.forEach(task => {
    rows.push([
      nameAnchorCell(task),
      completedAtDateCell(task),
      completedByCell(task),
      taskTypeCell(task),
      decisionCell(task),
    ])
  })

  return rows
}

const tasksTableRows = (tasks: Array<Task>, allocatedFilter: string): Array<TableRow> => {
  if (allocatedFilter === 'allocated') {
    return allocatedTableRows(tasks)
  }
  if (allocatedFilter === 'unallocated') {
    return unallocatedTableRows(tasks)
  }
  return completedTableRows(tasks)
}

const allocatedTableHeader = (sortBy: TaskSortField, sortDirection: SortDirection, hrefPrefix: string) => {
  return [
    sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Arrival date', 'expectedArrivalDate', sortBy, sortDirection, hrefPrefix),
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
    sortHeader<TaskSortField>('Arrival date', 'expectedArrivalDate', sortBy, sortDirection, hrefPrefix),
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

const completedTableHeader = (sortBy: TaskSortField, sortDirection: SortDirection, hrefPrefix: string) => {
  return [
    sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Completed at', 'completedAt', sortBy, sortDirection, hrefPrefix),
    {
      text: 'Completed by',
    },
    sortHeader<TaskSortField>('Task type', 'taskType', sortBy, sortDirection, hrefPrefix),
    sortHeader<TaskSortField>('Decision', 'decision', sortBy, sortDirection, hrefPrefix),
  ]
}

const tasksTableHeader = (
  activeTab: 'allocated' | 'unallocated' | 'completed',
  sortBy: TaskSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
) => {
  if (activeTab === 'allocated') {
    return allocatedTableHeader(sortBy, sortDirection, hrefPrefix)
  }
  if (activeTab === 'unallocated') {
    return unAllocatedTableHeader(sortBy, sortDirection, hrefPrefix)
  }
  return completedTableHeader(sortBy, sortDirection, hrefPrefix)
}

const taskParams = (task: Task) => ({ id: task.id, taskType: kebabCase(task.taskType) })

export type TabItem = {
  text: string
  active: boolean
  href: string
  classes?: string
}

const tasksTabItems = (hrefPrefix: string, activeTab = 'allocated'): Array<TabItem> => {
  const [path, query] = hrefPrefix.split('?')
  const urlParams = new URLSearchParams(query)

  const allocatedParams = {
    ...Object.fromEntries(urlParams),
    allocatedFilter: 'allocated',
    activeTab: 'allocated',
  } as Record<string, string>
  const { allocatedToUserId: _, ...unallocatedParams } = {
    ...Object.fromEntries(urlParams),
    allocatedFilter: 'unallocated',
    activeTab: 'unallocated',
  } as Record<string, string>

  const completedParams = {
    ...Object.fromEntries(urlParams),
    allocatedFilter: 'allocated',
    activeTab: 'completed',
  } as Record<string, string>

  const allocatedTabHref = new URLSearchParams(allocatedParams).toString()
  const unallocatedTabHref = new URLSearchParams(unallocatedParams).toString()
  const completedTabHref = new URLSearchParams(completedParams).toString()

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
    {
      text: 'Completed',
      active: activeTab === 'completed',
      href: `${path}?${completedTabHref}`,
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
  tasksTableRows,
  unallocatedTableRows,
  taskParams,
  getTaskType,
  tasksTabItems,
  completedTableHeader,
  completedTableRows,
}
