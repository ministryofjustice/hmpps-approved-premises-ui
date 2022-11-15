import type { Request } from 'express'
import type { TaskListErrors, DataServices } from '@approved-premises/ui'

export default abstract class TasklistPage {
  abstract name: string

  abstract title: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): Record<string, unknown>

  async setup?(request: Request, dataServices: DataServices): Promise<void>
}
