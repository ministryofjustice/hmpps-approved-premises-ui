import { Task, UserWithWorkload } from '../../@types/shared'
import { TableCell, TableRow } from '../../@types/ui'
import paths from '../../paths/tasks'
import { qualificationDictionary } from '../users'
import { kebabCase } from '../utils'

export const userTableHeader = () => [
  { text: 'Name' },
  { text: 'Region' },
  { text: 'Qualification' },
  { text: 'Assessments pending' },
  { text: 'Assessments completed in previous 7 days' },
  { text: 'Assessments completed in previous 30 days' },
  { text: 'Action' },
]

export const userTableRows = (users: Array<UserWithWorkload>, task: Task, csrfToken: string): Array<TableRow> => {
  return users.map(user => [
    nameCell(user),
    regionCell(user),
    qualificationCell(user),
    allocationCell(user, 'numAssessmentsPending'),
    allocationCell(user, 'numAssessmentsCompleted7Days'),
    allocationCell(user, 'numAssessmentsCompleted30Days'),
    buttonCell(user, task, csrfToken),
  ])
}

type AllocationType = Extract<
  keyof UserWithWorkload,
  'numAssessmentsPending' | 'numAssessmentsCompleted7Days' | 'numAssessmentsCompleted30Days'
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
