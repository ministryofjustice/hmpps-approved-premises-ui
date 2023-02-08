import type { Request } from 'express'
import {
  ApprovedPremisesAssessment as Assessment,
  NewClarificationNote,
  UpdatedClarificationNote,
} from '@approved-premises/api'
import type { DataServices } from '@approved-premises/ui'

import type { RestClientBuilder, AssessmentClient } from '../data'
import TasklistPage, { TasklistPageInterface } from '../form-pages/tasklistPage'
import { getBody, updateAssessmentData } from '../form-pages/utils'
import { ValidationError } from '../utils/errors'
import { getResponses } from '../utils/applicationUtils'
import { applicationAccepted } from '../utils/assessments/utils'

export default class AssessmentService {
  constructor(private readonly assessmentClientFactory: RestClientBuilder<AssessmentClient>) {}

  async getAll(token: string): Promise<Array<Assessment>> {
    const client = this.assessmentClientFactory(token)

    return client.all()
  }

  async getAllForUser(token: string, userId: string): Promise<Array<Assessment>> {
    const client = this.assessmentClientFactory(token)
    const assessments = await client.all()

    return assessments.filter(a => a.allocatedToStaffMember?.id === userId)
  }

  async findAssessment(token: string, id: string): Promise<Assessment> {
    const client = this.assessmentClientFactory(token)
    const assessment = await client.find(id)

    return assessment
  }

  async initializePage(
    Page: TasklistPageInterface,
    assessment: Assessment,
    request: Request,
    dataServices: DataServices,
    userInput?: Record<string, unknown>,
  ) {
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

  async submit(token: string, assessment: Assessment) {
    const client = this.assessmentClientFactory(token)

    const responses = getResponses(assessment)

    if (!applicationAccepted(assessment)) {
      return client.rejection(assessment.id, responses, assessment.rejectionRationale)
    }

    return client.acceptance(assessment.id, responses)
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
