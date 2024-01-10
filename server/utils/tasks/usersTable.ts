import { Task, UserWithWorkload } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { qualificationDictionary } from '../users'
import { kebabCase } from '../utils'

export const userTableHeader = () => [
  {
    text: 'Name',
    attributes: {
      'aria-sort': 'ascending',
    },
  },
  { text: 'Region' },
  { text: 'Qualification' },
  {
    text: 'Tasks pending',
    attributes: {
      'aria-sort': 'none',
    },
  },
  {
    text: 'Tasks completed in previous 7 days',
    attributes: {
      'aria-sort': 'none',
    },
  },
  {
    text: 'Tasks completed in previous 30 days',
    attributes: {
      'aria-sort': 'none',
    },
  },
  { text: 'Action' },
]

export const userTableRows = (users: Array<UserWithWorkload>, task: Task, csrfToken: string): Array<TableRow> => {
  return users.map(user => [
    nameCell(user),
    regionCell(user),
    qualificationCell(user),
    allocationCell(user, 'numTasksPending'),
    allocationCell(user, 'numTasksCompleted7Days'),
    allocationCell(user, 'numTasksCompleted30Days'),
    buttonCell(user, task, csrfToken),
  ])
}

type AllocationType = Extract<
  keyof UserWithWorkload,
  'numTasksPending' | 'numTasksCompleted7Days' | 'numTasksCompleted30Days'
>

export const nameCell = (user: UserWithWorkload): TableCell => ({ text: user.name })
export const regionCell = (user: UserWithWorkload): TableCell => ({ text: user.region.name })
export const qualificationCell = (user: UserWithWorkload): TableCell => ({
  text: user.qualifications.map(qualification => qualificationDictionary[qualification]).join(', '),
})
export const allocationCell = (user: UserWithWorkload, allocationType: AllocationType): TableCell => ({
  text: user?.[allocationType] ? user[allocationType].toString() : '0',
})
export const buttonCell = (user: UserWithWorkload, task: Task, csrfToken: string) => ({
  html: `<form action="${paths.tasks.allocations.create({
    taskType: kebabCase(task.taskType),
    id: task.id,
  })}" method="post">
  <input type="hidden" name="userId" value="${user.id}" />
  <input type="hidden" name="_csrf" value="${csrfToken}" />
   <button class="govuk-button govuk-button--secondary" type="submit" data-cy-userId="${user.id}">Allocate</button>
  </form>`,
})
