import { TaskStatus } from '../../@types/shared'
import { StatusTag, StatusTagOptions } from '../statusTag'

export class TaskStatusTag extends StatusTag<TaskStatus> {
  static readonly statuses: Record<TaskStatus, string> = {
    complete: 'Complete',
    in_progress: 'In progress',
    not_started: 'Not started',
    info_requested: 'Info requested',
  }

  static readonly colours: Record<TaskStatus, string> = {
    complete: 'green',
    in_progress: 'grey',
    not_started: 'blue',
    info_requested: 'yellow',
  }

  constructor(status: TaskStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: TaskStatusTag.statuses,
      colours: TaskStatusTag.colours,
    })
  }
}
