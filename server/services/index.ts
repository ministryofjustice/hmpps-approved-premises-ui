/* istanbul ignore file */

import { dataAccess } from '../data'

import AuditService from './auditService'
import UserService from './userService'
import PremisesService from './premisesService'
import PlacementService from './placementService'
import PersonService from './personService'
import BookingService from './bookingService'
import CancellationService from './cancellationService'
import ApplicationService from './applicationService'
import OutOfServiceBedService from './outOfServiceBedService'
import AssessmentService from './assessmentService'
import TaskService from './taskService'
import PlacementRequestService from './placementRequestService'
import PlacementApplicationService from './placementApplicationService'
import SpaceService from './spaceService'
import ReportService from './reportService'
import ApAreaService from './apAreaService'
import CruManagementAreaService from './cruManagementAreaService'
import AppealService from './appealService'

import config, { AuditConfig } from '../config'

export const services = () => {
  const {
    appealClientBuilder,
    approvedPremisesClientBuilder,
    placementClientBuilder,
    bookingClientBuilder,
    cas1ReferenceDataClientBuilder,
    referenceDataClientBuilder,
    outOfServiceBedClientBuilder,
    personClient,
    applicationClientBuilder,
    assessmentClientBuilder,
    userClientBuilder,
    taskClientBuilder,
    placementRequestClientBuilder,
    placementApplicationClientBuilder,
    bedClientBuilder,
    reportClientBuilder,
  } = dataAccess()

  const appealService = new AppealService(appealClientBuilder)
  const userService = new UserService(userClientBuilder, referenceDataClientBuilder)
  const auditService = new AuditService(config.apis.audit as AuditConfig)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const placementService = new PlacementService(placementClientBuilder)
  const personService = new PersonService(personClient)
  const bookingService = new BookingService(bookingClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const outOfServiceBedService = new OutOfServiceBedService(
    outOfServiceBedClientBuilder,
    cas1ReferenceDataClientBuilder,
  )
  const applicationService = new ApplicationService(applicationClientBuilder)
  const assessmentService = new AssessmentService(assessmentClientBuilder)
  const taskService = new TaskService(taskClientBuilder)
  const placementRequestService = new PlacementRequestService(placementRequestClientBuilder)
  const placementApplicationService = new PlacementApplicationService(placementApplicationClientBuilder)
  const spaceService = new SpaceService(bedClientBuilder)
  const reportService = new ReportService(reportClientBuilder)
  const apAreaService = new ApAreaService(referenceDataClientBuilder)
  const cruManagementAreaService = new CruManagementAreaService(cas1ReferenceDataClientBuilder)

  return {
    appealService,
    userService,
    auditService,
    premisesService,
    placementService,
    personService,
    bookingService,
    cancellationService,
    outOfServiceBedService,
    applicationService,
    assessmentService,
    taskService,
    placementRequestService,
    placementApplicationService,
    spaceService,
    reportService,
    apAreaService,
    cruManagementAreaService,
  }
}

export type Services = ReturnType<typeof services>

export {
  AppealService,
  UserService,
  PremisesService,
  PlacementService,
  PersonService,
  CancellationService,
  BookingService,
  OutOfServiceBedService,
  ApplicationService,
  AssessmentService,
  TaskService,
  PlacementRequestService,
  PlacementApplicationService,
  SpaceService,
  ReportService,
  ApAreaService,
  CruManagementAreaService,
}
