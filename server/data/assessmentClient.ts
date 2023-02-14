import type {
  ApprovedPremisesAssessment as Assessment,
  ClarificationNote,
  NewClarificationNote,
  UpdatedClarificationNote,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { ApplicationOrAssessmentResponse } from '../utils/applications/utils'

export default class AssessmentClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('assessmentClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async all(): Promise<Array<Assessment>> {
    return (await this.restClient.get({ path: paths.assessments.index.pattern })) as Array<Assessment>
  }

  async find(assessmentId: string): Promise<Assessment> {
    return (await this.restClient.get({ path: paths.assessments.show({ id: assessmentId }) })) as Assessment
  }

  async update(assessment: Assessment): Promise<Assessment> {
    return (await this.restClient.put({
      path: paths.assessments.update({ id: assessment.id }),
      data: { data: assessment.data },
    })) as Assessment
  }

  async acceptance(assessmentId: string, document: ApplicationOrAssessmentResponse): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.acceptance({ id: assessmentId }),
      data: { document },
    })
  }

  async rejection(
    assessmentId: string,
    document: ApplicationOrAssessmentResponse,
    rejectionRationale: string,
  ): Promise<void> {
    await this.restClient.post({
      path: paths.assessments.rejection({ id: assessmentId }),
      data: { document, rejectionRationale },
    })
  }

  async createClarificationNote(
    assessmentId: string,
    clarificationNote: NewClarificationNote,
  ): Promise<ClarificationNote> {
    return (await this.restClient.post({
      path: paths.assessments.clarificationNotes.create({ id: assessmentId }),
      data: clarificationNote,
    })) as ClarificationNote
  }

  async updateClarificationNote(
    assessmentId: string,
    clarificationNoteId: string,
    clarificationNote: UpdatedClarificationNote,
  ): Promise<ClarificationNote> {
    return (await this.restClient.put({
      path: paths.assessments.clarificationNotes.update({ id: assessmentId, clarificationNoteId }),
      data: clarificationNote,
    })) as ClarificationNote
  }
}
