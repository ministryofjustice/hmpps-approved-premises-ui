/* istanbul ignore file */

import type { TaskListErrors, DataServices, PageResponse } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'

export interface TasklistPageInterface {
  new (body: Record<string, unknown>, application?: ApprovedPremisesApplication, previousPage?: string): TasklistPage
  initialize?(
    body: Record<string, unknown>,
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<TasklistPage>
}

export default abstract class TasklistPage {
  abstract title: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): PageResponse
}
