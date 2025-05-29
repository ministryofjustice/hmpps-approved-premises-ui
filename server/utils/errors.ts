import type { TaskListErrors } from '@approved-premises/ui'
import TaskListPage from '../form-pages/tasklistPage'

export class ValidationError<T extends TaskListPage> extends Error {
  data: TaskListErrors<T>

  redirect: string

  constructor(data: TaskListErrors<T>, redirect?: string) {
    super('Validation error')
    this.data = data
    this.redirect = redirect
  }
}

export class SessionDataError extends Error {}

export class UnknownPageError extends Error {
  constructor(pageName: string) {
    super(`Cannot find the page ${pageName}`)
  }
}

export class TasklistAPIError extends Error {
  field: string

  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}

export class ErrorWithData extends Error {
  constructor(private readonly data: Record<string, unknown>) {
    super()
  }
}

export class RestrictedPersonError extends Error {
  type: 'RESTRICTED_PERSON'

  constructor(crn: string) {
    super(`CRN: ${crn} is restricted`)
    this.type = 'RESTRICTED_PERSON'
  }
}
