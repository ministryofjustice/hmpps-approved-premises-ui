import {
  PlacementApplication,
  PlacementApplicationDecisionEnvelope,
  SubmitPlacementApplication,
  WithdrawPlacementRequestReason,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'

export default class PlacementApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementApplicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(id: string): Promise<PlacementApplication> {
    return this.restClient.get<PlacementApplication>({
      path: paths.placementApplications.show({ id }),
    })
  }

  async create(applicationId: string): Promise<PlacementApplication> {
    return this.restClient.post<PlacementApplication>({
      path: paths.placementApplications.create({}),
      data: { applicationId },
    })
  }

  async update(placementApplication: PlacementApplication): Promise<PlacementApplication> {
    return this.restClient.put<PlacementApplication>({
      path: paths.placementApplications.update({ id: placementApplication.id }),
      data: placementApplication,
    })
  }

  async submission(
    placementApplicationId: string,
    submitPlacementApplication: SubmitPlacementApplication,
  ): Promise<PlacementApplication> {
    return this.restClient.post<PlacementApplication>({
      path: paths.placementApplications.submit({ id: placementApplicationId }),
      data: submitPlacementApplication,
    })
  }

  async decisionSubmission(
    placementApplicationId: string,
    decision: PlacementApplicationDecisionEnvelope,
  ): Promise<PlacementApplication> {
    return this.restClient.post<PlacementApplication>({
      path: paths.placementApplications.submitDecision({ id: placementApplicationId }),
      data: decision,
    })
  }

  async withdraw(
    placementApplicationId: string,
    reason: WithdrawPlacementRequestReason,
  ): Promise<PlacementApplication> {
    return this.restClient.post<PlacementApplication>({
      path: paths.placementApplications.withdraw({ id: placementApplicationId }),
      data: { reason },
    })
  }
}
