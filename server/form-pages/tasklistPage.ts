/* istanbul ignore file */

import type { DataServices, PageResponse, TaskData, TaskListErrors } from '@approved-premises/ui'

export interface TasklistPageInterface {
  new (body: Record<string, unknown>, data?: TaskData): TasklistPage
  initialize?(
    body: Record<string, unknown>,
    data: TaskData,
    token: string,
    dataServices: Partial<DataServices>,
  ): Promise<TasklistPage>
}

export default abstract class TasklistPage {
  abstract title: string

  abstract name?: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): PageResponse
}
