/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
/* istanbul ignore file */

import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import PremisesClient from './premisesClient'
import ReferenceDataClient from './referenceDataClient'
import Cas1ReferenceDataClient from './cas1ReferenceDataClient'
import PersonClient from './personClient'
import UserClient from './userClient'

import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import ApplicationClient from './applicationClient'
import AssessmentClient from './assessmentClient'
import TaskClient from './taskClient'
import PlacementRequestClient from './placementRequestClient'
import PlacementApplicationClient from './placementApplicationClient'
import BedClient from './spaceSearchClient'
import ReportClient from './reportClient'
import AppealClient from './appealClient'
import OutOfServiceBedClient from './outOfServiceBedClient'
import PlacementClient from './placementClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  appealClientBuilder: ((token: string) => new AppealClient(token)) as RestClientBuilder<AppealClient>,
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  placementClientBuilder: ((token: string) => new PlacementClient(token)) as RestClientBuilder<PlacementClient>,
  referenceDataClientBuilder: ((token: string) =>
    new ReferenceDataClient(token)) as RestClientBuilder<ReferenceDataClient>,
  cas1ReferenceDataClientBuilder: ((token: string) =>
    new Cas1ReferenceDataClient(token)) as RestClientBuilder<Cas1ReferenceDataClient>,
  outOfServiceBedClientBuilder: ((token: string) =>
    new OutOfServiceBedClient(token)) as RestClientBuilder<OutOfServiceBedClient>,
  personClient: ((token: string) => new PersonClient(token)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((token: string) => new ApplicationClient(token)) as RestClientBuilder<ApplicationClient>,
  assessmentClientBuilder: ((token: string) => new AssessmentClient(token)) as RestClientBuilder<AssessmentClient>,
  userClientBuilder: ((token: string) => new UserClient(token)) as RestClientBuilder<UserClient>,
  taskClientBuilder: ((token: string) => new TaskClient(token)) as RestClientBuilder<TaskClient>,
  placementRequestClientBuilder: ((token: string) =>
    new PlacementRequestClient(token)) as RestClientBuilder<PlacementRequestClient>,
  placementApplicationClientBuilder: ((token: string) =>
    new PlacementApplicationClient(token)) as RestClientBuilder<PlacementApplicationClient>,
  bedClientBuilder: ((token: string) => new BedClient(token)) as RestClientBuilder<BedClient>,
  reportClientBuilder: ((token: string) => new ReportClient(token)) as RestClientBuilder<ReportClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  AppealClient,
  BedClient,
  Cas1ReferenceDataClient,
  PremisesClient,
  HmppsAuthClient,
  type RestClientBuilder,
  ReferenceDataClient,
  OutOfServiceBedClient,
  PersonClient,
  ApplicationClient,
  AssessmentClient,
  UserClient,
  TaskClient,
  PlacementRequestClient,
}
