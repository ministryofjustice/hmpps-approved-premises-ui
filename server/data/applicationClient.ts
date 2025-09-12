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
    return (await this.restClient.get({
      path: paths.applications.show({ id: applicationId }),
    })) as Application
  }

  async create(crn: string, activeOffence: ActiveOffence): Promise<Application> {
    const { convictionId, deliusEventNumber, offenceId } = activeOffence

    return (await this.restClient.post({
      path: paths.applications.new.pattern,
      data: { crn, convictionId, deliusEventNumber, offenceId, type: 'CAS1' },
    })) as Application
  }

  async update(applicationId: string, updateData: UpdateApprovedPremisesApplication): Promise<Application> {
    return (await this.restClient.put({
      path: paths.applications.update({ id: applicationId }),
      data: { ...updateData, type: 'CAS1' },
    })) as Application
  }

  async allForLoggedInUser(): Promise<Array<Cas1ApplicationSummary>> {
    return (await this.restClient.get({
      path: paths.applications.me.pattern,
    })) as Array<Cas1ApplicationSummary>
  }

  async all(
    page: number,
    sortBy: ApplicationSortField,
    sortDirection: SortDirection,
    searchOptions: ApplicationDashboardSearchOptions,
  ): Promise<PaginatedResponse<Cas1ApplicationSummary>> {
    searchOptions.crnOrName = normaliseCrn(searchOptions.crnOrName)
    return this.restClient.getPaginatedResponse<Cas1ApplicationSummary>({
      path: paths.applications.all.pattern,
      page: page.toString(),
      query: { ...searchOptions, sortBy, sortDirection },
    })
  }

  async submit(applicationId: string, submissionData: SubmitApprovedPremisesApplication): Promise<void> {
    await this.restClient.post({
      path: paths.applications.submission({ id: applicationId }),
      data: { ...submissionData, type: 'CAS1' },
    })
  }

  async documents(application: Application): Promise<Array<Document>> {
    return (await this.restClient.get({
      path: paths.applications.documents({ id: application.id }),
    })) as Array<Document>
  }

  async withdrawal(applicationId: string, body: NewWithdrawal): Promise<void> {
    await this.restClient.post({
      path: paths.applications.withdrawal({ id: applicationId }),
      data: body,
    })
  }

  async timeline(applicationId: string): Promise<Array<Cas1TimelineEvent>> {
    return (await this.restClient.get({
      path: paths.applications.timeline({ id: applicationId }),
    })) as Array<Cas1TimelineEvent>
  }

  async requestsForPlacement(applicationId: string): Promise<Array<RequestForPlacement>> {
    return (await this.restClient.get({
      path: paths.applications.requestsForPlacement({ id: applicationId }),
    })) as Array<RequestForPlacement>
  }

  async addNote(applicationId: string, note: ApplicationTimelineNote): Promise<ApplicationTimelineNote> {
    return (await this.restClient.post({
      path: paths.applications.addNote({ id: applicationId }),
      data: note,
    })) as ApplicationTimelineNote
  }

  async withdrawablesWithNotes(applicationId: string): Promise<Withdrawables> {
    return (await this.restClient.get({
      path: paths.applications.withdrawablesWithNotes({ id: applicationId }),
    })) as Withdrawables
  }
}
