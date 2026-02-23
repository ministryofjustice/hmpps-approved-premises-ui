import type {
  ActiveOffence,
  ApprovedPremisesApplication as Application,
  ApplicationSortField,
  ApplicationTimelineNote,
  Cas1ApplicationSummary,
  Cas1TimelineEvent,
  Document,
  NewWithdrawal,
  RequestForPlacement,
  SortDirection,
  SubmitApprovedPremisesApplication,
  UpdateApprovedPremisesApplication,
  Withdrawables,
  Cas1ExpireApplicationReason,
} from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { ApplicationDashboardSearchOptions, PaginatedResponse } from '../@types/ui'
import { normaliseCrn } from '../utils/normaliseCrn'

export default class ApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('applicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(applicationId: string): Promise<Application> {
    return this.restClient.get<Application>({
      path: paths.applications.show({ id: applicationId }),
    })
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return this.restClient.post<Application>({
      path: paths.applications.new.pattern,
      data: { crn, convictionId, deliusEventNumber, offenceId, type: 'CAS1' },
    })
  }

  async update(applicationId: string, updateData: UpdateApprovedPremisesApplication): Promise<Application> {
    return this.restClient.put<Application>({
      path: paths.applications.update({ id: applicationId }),
      data: { ...updateData, type: 'CAS1' },
    })
  }

  async allForLoggedInUser(): Promise<Array<Cas1ApplicationSummary>> {
    return this.restClient.get<Array<Cas1ApplicationSummary>>({
      path: paths.applications.me.pattern,
    })
  }

  async all(
    page: number,
    sortBy: ApplicationSortField,
    sortDirection: SortDirection,
    searchOptions: ApplicationDashboardSearchOptions,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<Cas1ApplicationSummary>> {
    searchOptions.crnOrName = normaliseCrn(searchOptions.crnOrName)
    return this.restClient.getPaginatedResponse<Cas1ApplicationSummary>({
      path: paths.applications.all.pattern,
      page: page.toString(),
      query: { ...searchOptions, sortBy, sortDirection, pageSize },
    })
  }

  async submit(applicationId: string, submissionData: SubmitApprovedPremisesApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: applicationId }),
      data: { ...submissionData, type: 'CAS1' },
    })
  }

  async documents(application: Application): Promise<Array<Document>> {
    return this.restClient.get<Array<Document>>({
      path: paths.applications.documents({ id: application.id }),
    })
  }

  async withdrawal(applicationId: string, body: NewWithdrawal): Promise<void> {
    await this.restClient.post({
      path: paths.applications.withdrawal({ id: applicationId }),
      data: body,
    })
  }

  async expire(applicationId: string, body: Cas1ExpireApplicationReason): Promise<void> {
    await this.restClient.post({
      path: paths.applications.expire({ id: applicationId }),
      data: body,
    })
  }

  async timeline(applicationId: string): Promise<Array<Cas1TimelineEvent>> {
    return this.restClient.get<Array<Cas1TimelineEvent>>({
      path: paths.applications.timeline({ id: applicationId }),
    })
  }

  async requestsForPlacement(applicationId: string): Promise<Array<RequestForPlacement>> {
    return this.restClient.get<Array<RequestForPlacement>>({
      path: paths.applications.requestsForPlacement({ id: applicationId }),
    })
  }

  async addNote(applicationId: string, note: ApplicationTimelineNote): Promise<ApplicationTimelineNote> {
    return this.restClient.post<ApplicationTimelineNote>({
      path: paths.applications.addNote({ id: applicationId }),
      data: note,
    })
  }

  async withdrawablesWithNotes(applicationId: string): Promise<Withdrawables> {
    return this.restClient.get<Withdrawables>({
      path: paths.applications.withdrawablesWithNotes({ id: applicationId }),
    })
  }
}
