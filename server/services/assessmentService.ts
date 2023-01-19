import type { Request } from 'express'
import {
  ApprovedPremisesAssessment as Assessment,
  NewClarificationNote,
  UpdatedClarificationNote,
} from '@approved-premises/api'
import type { DataServices, GroupedAssessments } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient } from '../data'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getBody, updateAssessmentData } from '../form-pages/utils'
import { ValidationError } from '../utils/errors'

export default class AssessmentService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAllForLoggedInUser(token: string): Promise<GroupedAssessments> {
    const client = this.assessmentClientFactory(token)

    const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments
    const assessments = await client.all()

    await Promise.all(
      assessments.map(async assessment => {
        switch (assessment.status) {
          case 'completed':
            result.completed.push(assessment)
            break
          case 'pending':
            result.requestedFurtherInformation.push(assessment)
            break
          default:
            result.awaiting.push(assessment)
            break
        }
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

    const page = Page.initialize
      ? await Page.initialize(body, assessment, request.user.token, dataServices)
      : new Page(body, assessment, request.session.previousPage)

    return page
  }

  async save(page: TasklistPage, request: Request) {
    const errors = page.errors()

    if (Object.keys(errors).length) {
      throw new ValidationError<typeof page>(errors)
    } else {
      const assessment = await this.findAssessment(request.user.token, request.params.id)
      const updatedAssessment = updateAssessmentData(page, assessment)

      const client = this.assessmentClientFactory(request.user.token)

      await client.update(updatedAssessment)
    }
  }

  async createClarificationNote(token: string, assessmentId: string, clarificationNote: NewClarificationNote) {
    const client = this.assessmentClientFactory(token)

    return client.createClarificationNote(assessmentId, clarificationNote)
  }

  async updateClarificationNote(
    token: string,
    assessmentId: string,
    clarificationNoteId: string,
    clarificationNote: UpdatedClarificationNote,
  ) {
    const client = this.assessmentClientFactory(token)

    return client.updateClarificationNote(assessmentId, clarificationNoteId, clarificationNote)
  }
}
