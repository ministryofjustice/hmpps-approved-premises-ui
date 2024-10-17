import { PageResponse, type TaskListErrors } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import AccessNeedsFurtherQuestions from './accessNeedsFurtherQuestions'
import { lowerCase } from '../../../../utils/utils'
import AccessNeeds, { AdditionalNeed, additionalNeeds } from './accessNeeds'

export type AccessNeedsAdditionalDetailsBody = {
  additionalAdjustments: string
}

@Page({
  name: 'access-needs-additional-details',
  bodyProperties: ['additionalAdjustments'],
})
export default class AccessNeedsAdditionalDetails implements TasklistPage {
  title = 'Access, cultural and healthcare needs'

  questions = {
    additionalAdjustments: `Specify any additional details and adjustments required for the person's ${this.listOfNeeds}`,
  }

  constructor(
    public body: Partial<AccessNeedsAdditionalDetailsBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous(): string {
    if (
      retrieveOptionalQuestionResponseFromFormArtifact(
        this.application,
        AccessNeedsFurtherQuestions,
        'isPersonPregnant',
      ) === 'yes'
    ) {
      return 'pregnancy'
    }

    return 'access-needs-further-questions'
  }

  next(): string {
    return 'covid'
  }

  errors(): Partial<Record<keyof this['body'], unknown>> {
    return {} as TaskListErrors<this>
  }

  response(): PageResponse {
    return {
      [this.questions.additionalAdjustments]: this.body.additionalAdjustments,
    }
  }

  public get additionalNeeds(): Array<AdditionalNeed> {
    return retrieveOptionalQuestionResponseFromFormArtifact(this.application, AccessNeeds, 'additionalNeeds')
  }

  public get listOfNeeds(): string {
    const needs = this.additionalNeeds.map(need => additionalNeeds[need])

    if (needs.length > 0) {
      if (needs.length === 1) {
        return lowerCase(`${needs[0]} needs`)
      }

      const lastNeed = needs.splice(-1)

      return lowerCase(`${needs.join(', ')} or ${lastNeed} needs`)
    }

    return null
  }
}
