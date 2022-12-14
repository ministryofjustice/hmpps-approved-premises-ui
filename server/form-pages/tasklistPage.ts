import type { TaskListErrors, DataServices } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'

export default abstract class TasklistPage {
  abstract title: string

  abstract body: Record<string, unknown>

  abstract previous(): string

  abstract next(): string

  abstract errors(): TaskListErrors<this>

  abstract response(): Record<string, unknown>

  static async initialize?(
    application: ApprovedPremisesApplication,
    token: string,
    dataServices: DataServices,
  ): Promise<TasklistPage>
}
