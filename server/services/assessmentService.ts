import type { Request } from 'express'
import { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { DataServices, GroupedAssessments } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient } from '../data'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getBody, getPageName, getTaskName } from '../form-pages/utils'
import { ValidationError } from '../utils/errors'

export default class AssessmentService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAllForLoggedInUser(token: string): Promise<GroupedAssessments> {
    const client = this.assessmentClientFactory(token)

    const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments
    const assessments = await client.all()

    await Promise.all(
      assessments.map(async assessment => {
        return assessment.decision ? result.completed.push(assessment) : result.awaiting.push(assessment)
      }),
    )

    return result
  }

  async findAssessment(token: string, id: string): Promise<Assessment> {
    const client = this.assessmentClientFactory(token)
    const assessment = await client.find(id)

    return assessment
  }

  async initializePage(
    Page: TasklistPageInterface,
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ) {
    const assessment = await this.findAssessment(request.user.token, request.params.id)
    const body = getBody(Page, assessment, request, userInput)

    return new Page(body, assessment, request.session.previousPage)
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const assessment = await this.findAssessment(request.user.token, request.params.id)

      const pageName = getPageName(page.constructor)
      const taskName = getTaskName(page.constructor)

      assessment.data = assessment.data || {}
      assessment.data[taskName] = assessment.data[taskName] || {}
      assessment.data[taskName][pageName] = page.body

      const client = this.assessmentClientFactory(request.user.token)

      await client.update(assessment)
    }
  }
}
