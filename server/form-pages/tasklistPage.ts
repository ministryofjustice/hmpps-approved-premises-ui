import type { TaskListErrors, DataServices } from '@approved-premises/ui'
import { Application } from '@approved-premises/api'

export default abstract class TasklistPage {
  abstract name: string

  abstract title: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): Record<string, unknown>

  static async initialize?(application: Application, token: string, dataServices: DataServices): Promise<TasklistPage>
}
