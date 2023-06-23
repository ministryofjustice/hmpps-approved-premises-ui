/* istanbul ignore file */

import { dataAccess } from '../data'

import AuditService from './auditService'
import UserService from './userService'
import PremisesService from './premisesService'
import PersonService from './personService'
import BookingService from './bookingService'
import ArrivalService from './arrivalService'
import NonArrivalService from './nonArrivalService'
import DepartureService from './departureService'
import CancellationService from './cancellationService'
import LostBedService from './lostBedService'
import ApplicationService from './applicationService'
import AssessmentService from './assessmentService'
import TaskService from './taskService'
import PlacementRequestService from './placementRequestService'
import PlacementApplicationService from './placementApplicationService'
import BedService from './bedService'
import config, { AuditConfig } from '../config'

export const services = () => {
  const {
    hmppsAuthClient,
    approvedPremisesClientBuilder,
    bookingClientBuilder,
    referenceDataClientBuilder,
    lostBedClientBuilder,
    personClient,
    applicationClientBuilder,
    assessmentClientBuilder,
    userClientBuilder,
    taskClientBuilder,
    placementRequestClientBuilder,
    placementApplicationClientBuilder,
    bedClientBuilder,
  } = dataAccess()

  const userService = new UserService(hmppsAuthClient, userClientBuilder)
  const auditService = new AuditService(config.apis.audit as AuditConfig)
  const premisesService = new PremisesService(approvedPremisesClientBuilder)
  const personService = new PersonService(personClient)
  const bookingService = new BookingService(bookingClientBuilder)
  const arrivalService = new ArrivalService(bookingClientBuilder)
  const nonArrivalService = new NonArrivalService(bookingClientBuilder, referenceDataClientBuilder)
  const departureService = new DepartureService(bookingClientBuilder, referenceDataClientBuilder)
  const cancellationService = new CancellationService(bookingClientBuilder, referenceDataClientBuilder)
  const lostBedService = new LostBedService(lostBedClientBuilder, referenceDataClientBuilder)
  const applicationService = new ApplicationService(applicationClientBuilder)
  const assessmentService = new AssessmentService(assessmentClientBuilder)
  const taskService = new TaskService(taskClientBuilder)
  const placementRequestService = new PlacementRequestService(placementRequestClientBuilder)
  const placementApplicationService = new PlacementApplicationService(placementApplicationClientBuilder)
  const bedService = new BedService(bedClientBuilder)

  return {
    userService,
    auditService,
    premisesService,
    personService,
    bookingService,
    arrivalService,
    nonArrivalService,
    departureService,
    cancellationService,
    lostBedService,
    applicationService,
    assessmentService,
    taskService,
    placementRequestService,
    placementApplicationService,
    bedService,
  }
}

export type Services = ReturnType<typeof services>

export {
  UserService,
  PremisesService,
  PersonService,
  ArrivalService,
  NonArrivalService,
  DepartureService,
  CancellationService,
  BookingService,
  LostBedService,
  ApplicationService,
  AssessmentService,
  TaskService,
  PlacementRequestService,
  PlacementApplicationService,
  BedService,
}
