import { Task } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import { DateFormats } from '../dateUtils'
import { sentenceCase } from '../utils'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

const allocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows: Array<TableRow> = []

  tasks.forEach(task => {
    rows.push([nameCell(task), daysUntilDueCell(task), allocationCell(task), statusCell(task), taskTypeCell(task)])
  })

  return rows
}

const unallocatedTableRows = (tasks: Array<Task>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  tasks.forEach(task => {
    rows.push([nameCell(task), daysUntilDueCell(task), statusCell(task), taskTypeCell(task)])
  })

  return rows
}

const nameCell = (task: Task): TableCell => ({
  text: task?.person?.name || '',
})

const daysUntilDueCell = (task: Task): TableCell => ({
  html: formatDaysUntilDueWithWarning(task),
  attributes: {
    'data-sort-value': daysUntilDue(task),
  },
})

const statusCell = (task: Task): TableCell => ({
  html: statusBadge(task),
})

const taskTypeCell = (task: Task): TableCell => ({
  html: task.taskType ? `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>` : '',
})

const allocationCell = (task: Task): TableCell => ({
  text: task.allocatedToStaffMember?.name || '',
})

const statusBadge = (task: Task): string => {
  const status = task?.status || ''
  switch (status) {
    case 'complete':
      return `<strong class="govuk-tag">${sentenceCase(status)}</strong>`
    case 'not_started':
      return `<strong class="govuk-tag govuk-tag--yellow">${sentenceCase(status)}</strong>`
    case 'in_progress':
      return `<strong class="govuk-tag govuk-tag--grey">${sentenceCase(status)}</strong>`
    default:
      return ''
  }
}

const formatDaysUntilDueWithWarning = (task: Task): string => {
  if (!task.dueDate) return ''

  const differenceInDays = DateFormats.differenceInDays(DateFormats.isoToDateObj(task.dueDate), new Date())

  if (differenceInDays.number < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="task--index__warning">${differenceInDays.number < 0 ? '-' : ''}${
      differenceInDays.ui
    }<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }

  return differenceInDays.ui
}

const daysUntilDue = (task: Task): number => {
  if (!task.dueDate) return 0

  return DateFormats.differenceInDays(DateFormats.isoToDateObj(task.dueDate), new Date()).number
}

export {
  allocatedTableRows,
  daysUntilDue,
  formatDaysUntilDueWithWarning,
  nameCell,
  daysUntilDueCell,
  statusCell,
  taskTypeCell,
  allocationCell,
  statusBadge,
  unallocatedTableRows,
}
