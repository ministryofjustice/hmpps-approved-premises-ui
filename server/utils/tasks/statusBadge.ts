import { Task, TaskStatus } from '../../@types/shared'

type StatusColour = 'green' | 'grey' | 'blue' | 'yellow'
type StatusTitle = 'Complete' | 'In progress' | 'Not started' | 'Info requested'
type HtmlStatusTag = `<strong class="govuk-tag govuk-tag--${StatusColour}">${StatusTitle}</strong>`

const statusTitles: Record<TaskStatus, StatusTitle> = {
  complete: 'Complete',
  in_progress: 'In progress',
  not_started: 'Not started',
  info_requested: 'Info requested',
}

const statusColours: Record<TaskStatus, StatusColour> = {
  complete: 'green',
  in_progress: 'grey',
  not_started: 'blue',
  info_requested: 'yellow',
}

export const statusBadge = (task: Task): HtmlStatusTag =>
  `<strong class="govuk-tag govuk-tag--${statusColours[task.status]}">${statusTitles[task.status]}</strong>`
