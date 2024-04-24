import { ApprovedPremisesApplicationStatus as ApplicationStatus, BookingStatus, TaskStatus } from '../@types/shared'

export type StatusTagOptions = { addLeftMargin?: boolean; showOnOneLine?: boolean }
type Status = ApplicationStatus | TaskStatus | BookingStatus
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

  if (Object.keys(colours).length) {
    classes += `govuk-tag--${colours[status]} `
  }

  if (options?.addLeftMargin) {
    classes += 'govuk-!-margin-5 '
  }

  if (options?.showOnOneLine) {
    classes += 'govuk-tag--timeline-tag '
  }

  return `<strong class="govuk-tag ${classes}" data-cy-status="${status}" ${id}>${statuses[status]}</strong>`
}
