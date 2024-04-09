/* istanbul ignore file */

import type { DataServices, FormArtifact, PageResponse, TaskListErrors } from '@approved-premises/ui'
import { FeatureFlags } from '../services/featureFlagService'

export interface TasklistPageInterface {
  new (body: Record<string, unknown>, document?: FormArtifact, featureFlags?: Partial<FeatureFlags>): TasklistPage
  initialize?(
    body: Record<string, unknown>,
    document: FormArtifact,
    token: string,
    dataServices: Partial<DataServices>,
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
