import type { TaskStatus as TaskListStatus, TaskWithStatus, UiTask } from '@approved-premises/ui'
import { Cas1Application as Application, Cas1Assessment as Assessment } from '../@types/shared'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import isAssessment from './assessments/isAssessment'
import { StatusTag } from './statusTag'
import { tierQualificationPage } from './applications/utils'

export const taskLink = (task: TaskWithStatus, applicationOrAssessment: Application | Assessment): string => {
  if (task.status !== 'cannot_start') {
    const firstPage = Object.keys(applicationOrAssessment?.data?.[task.id] || task.pages)[0]

    const link = isAssessment(applicationOrAssessment)
      ? assessPaths.assessments.pages.show({
          id: applicationOrAssessment.id,
          task: task.id,
          page: firstPage,
        })
      : (task.id === 'basic-information' && tierQualificationPage(applicationOrAssessment)) ||
        applyPaths.applications.pages.show({
          id: (applicationOrAssessment as Application).id,
          task: task.id,
          page: firstPage,
        })

    return `<a href="${link}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
  }
  return task.title
}

export class TaskListStatusTag extends StatusTag<TaskListStatus> {
  static readonly statuses: Record<TaskListStatus, string> = {
    complete: 'Completed',
    in_progress: 'In progress',
    not_started: 'Not started',
    cannot_start: 'Cannot start yet',
  }

  static readonly colours: Record<TaskListStatus, string> = {
    complete: '',
    in_progress: 'blue',
    not_started: 'grey',
    cannot_start: 'grey',
  }

  constructor(status: TaskListStatus, taskId: UiTask['id']) {
    super(
      status,
      { classes: `app-task-list__tag`, id: taskId },
      {
        statuses: TaskListStatusTag.statuses,
        colours: TaskListStatusTag.colours,
      },
    )
  }
}
