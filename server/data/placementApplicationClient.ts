import {
  PlacementApplication,
  PlacementApplicationDecisionEnvelope,
  SubmitPlacementApplication,
} from '@approved-premises/api'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import paths from '../paths/api'
import { WithdrawPlacementRequestReason } from '../@types/shared/models/WithdrawPlacementRequestReason'

export default class PlacementApplicationClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('placementApplicationClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async find(id: string): Promise<PlacementApplication> {
    return (await this.restClient.get({
      path: paths.placementApplications.show({ id }),
    })) as Promise<PlacementApplication>
  }

  async create(applicationId: string): Promise<PlacementApplication> {
    return (await this.restClient.post({
      path: paths.placementApplications.create({}),
      data: { applicationId },
    })) as Promise<PlacementApplication>
  }

  async update(placementApplication: PlacementApplication): Promise<PlacementApplication> {
    return (await this.restClient.put({
      path: paths.placementApplications.update({ id: placementApplication.id }),
      data: placementApplication,
    })) as Promise<PlacementApplication>
  }

  async submission(
    placementApplicationId: string,
    submitPlacementApplication: SubmitPlacementApplication,
  ): Promise<PlacementApplication> {
    return (await this.restClient.post({
      path: paths.placementApplications.submit({ id: placementApplicationId }),
      data: submitPlacementApplication,
    })) as Promise<PlacementApplication>
  }

  async decisionSubmission(
    placementApplicationId: string,
    decision: PlacementApplicationDecisionEnvelope,
  ): Promise<PlacementApplication> {
    return (await this.restClient.post({
      path: paths.placementApplications.submitDecision({ id: placementApplicationId }),
      data: decision,
    })) as Promise<PlacementApplication>
  }

  async withdraw(
    placementApplicationId: string,
    reason: WithdrawPlacementRequestReason,
  ): Promise<PlacementApplication> {
    return (await this.restClient.post({
      path: paths.placementApplications.withdraw({ id: placementApplicationId }),
      data: { reason },
    })) as Promise<PlacementApplication>
  }
}
