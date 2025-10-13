import {
  ApprovedPremisesApplicationStatus as ApplicationStatus,
  BookingStatus,
  PersonStatus,
  RequestForPlacementStatus,
  TaskStatus,
} from '@approved-premises/api'
import { TaskStatus as TaskListStatus } from '@approved-premises/ui'
// eslint-disable-next-line import/no-cycle
import { AssessmentStatusForUi } from './assessments/statusTag'
import { SpaceBookingStatus } from './placements'

export type StatusTagOptions = {
  classes?: string
  id?: string
}
type Status =
  | ApplicationStatus
  | TaskStatus
  | BookingStatus
  | PersonStatus
  | AssessmentStatusForUi
  | TaskListStatus
  | RequestForPlacementStatus
  | SpaceBookingStatus

export class StatusTag<T extends Status> {
  status: T

  uiStatus: string

  options: StatusTagOptions = {}

  colours: Record<T, string>

  statuses: Record<T, string>

  constructor(
    status: T,
    options: StatusTagOptions,
    dictionaries: { statuses: Record<T, string>; colours: Record<T, string> },
  ) {
    this.status = status
    this.uiStatus = dictionaries.statuses[status]
    this.options = options
    this.colours = dictionaries.colours
    this.statuses = dictionaries.statuses
  }

  html(): string {
    return createTag(this.status, this.statuses, this.colours, this.options)
  }
}

export const createTag = <T extends Status>(
  status: Status,
  statuses: Record<T, string>,
  colours: Record<T, string> = {} as Record<T, string>,
  options: StatusTagOptions = {},
) => {
  let classes = ''
  let id = ''

  if (Object.keys(colours).length) {
    classes += `govuk-tag--${colours[status as T]} `
  }

  if (options?.classes) {
    classes += options.classes
  }

  if (options?.id) {
    id = `id="${options.id}-status"`
  }

  return `<strong class="govuk-tag ${classes}" data-cy-status="${status}" ${id}>${statuses[status as T]}</strong>`
}
