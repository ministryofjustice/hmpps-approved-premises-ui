/* istanbul ignore file */

import acctAlertFactory from './acctAlert'
import activeOffenceFactory from './activeOffence'
import adjudicationFactory from './adjudication'
import appealFactory from './appealFactory'
import applicationFactory from './application'
import applicationSummaryFactory from './applicationSummary'
import arrivalFactory from './arrival'
import assessmentTaskFactory from './assessmentTask'
import assessmentFactory from './assessment'
import assessmentSummaryFactory from './assessmentSummary'
import bedSummaryFactory from './bedSummary'
import bedDetailFactory from './bedDetail'
import { apCharacteristicPairFactory, bedSearchResultFactory, bedSearchResultsFactory } from './bedSearchResult'
import bookingAppealTask from './bookingAppealTask'
import bookingSummaryFactory from './bookingSummary'
import bookingFactory from './booking'
import bookingExtensionFactory from './bookingExtension'
import bookingNotMadeFactory from './bookingNotMade'
import cancellationFactory from './cancellation'
import clarificationNoteFactory from './clarificationNote'
import contingencyPlanPartnerFactory from './contingencyPlanPartner'
import contingencyPlanQuestionsBodyFactory from './contingencyPlanQuestionsBody'
import dateCapacityFactory from './dateCapacity'
import dateChangeFactory from './dateChange'
import departureFactory from './departure'
import documentFactory from './document'
import extendedPremisesSummaryFactory from './extendedPremisesSummary'
import newCancellationFactory from './newCancellation'
import {
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
} from './newPlacementRequestBooking'
import newAppealFactory from './newAppealFactory'
import noteFactory from './noteFactory'
import oasysSectionsFactory, { roshSummaryFactory } from './oasysSections'
import oasysSelectionFactory from './oasysSelection'
import {
  newOutOfServiceBedFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedFactory,
  outOfServiceBedRevisionFactory,
} from './outOfServiceBed'
import paginatedResponseFactory from './paginatedResponse'
import { fullPersonFactory as personFactory, restrictedPersonFactory } from './person'
import placementApplicationFactory from './placementApplication'
import placementApplicationTaskFactory from './placementApplicationTask'
import placementDatesFactory from './placementDates'
import { placementRequestFactory, placementRequestWithFullPersonFactory } from './placementRequest'
import placementRequestDetailFactory from './placementRequestDetail'
import placementRequestTaskFactory from './placementRequestTask'
import premisesFactory from './premises'
import premisesSummaryFactory from './premisesSummary'
import prisonCaseNotesFactory from './prisonCaseNotes'
import reallocationFactory from './reallocation'
import referenceDataFactory, { apAreaFactory, probationRegionFactory } from './referenceData'
import cas1ReferenceDataFactory, { cruManagementAreaFactory } from './cas1ReferenceData'
import requestForPlacementFactory from './requestForPlacement'
import risksFactory, { tierEnvelopeFactory } from './risks'
import staffMemberFactory from './staffMember'
import taskFactory from './task'
import taskWrapperFactory from './taskWrapperFactory'
import { applicationTimelineFactory, personalTimelineFactory, timelineEventFactory } from './timeline'
import userFactory, { userSummaryFactory, userWithWorkloadFactory } from './user'
import userDetailsFactory from './userDetails'
import placementApplicationDecisionEnvelopeFactory from './placementApplicationDecisionEnvelope'
import premisesBookingFactory from './premisesBooking'
import bookingPremisesSummaryFactory from './bookingPremisesSummary'
import withdrawableFactory from './withdrawableFactory'
import cancellationReasonFactory from './cancellationReason'
import newSpaceBookingFactory from './newSpaceBooking'
import premisesSearchResultSummaryFactory from './premisesSearchResultSummary'
import spaceBookingFactory from './spaceBooking'
import spaceBookingRequirementsFactory from './spaceBookingRequirements'
import spaceCategoryAvailabilityFactory from './spaceAvailability'
import spaceSearchParametersFactory, { spaceSearchParametersUiFactory } from './spaceSearchParameters'
import spaceSearchResultFactory from './spaceSearchResult'
import spaceSearchResultsFactory from './spaceSearchResults'
import cas1PremisesSummaryFactory from './cas1PremisesSummary'
import cas1PremisesBasicSummaryFactory from './cas1PremisesBasicSummary'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import cas1SpaceBookingFactory from './cas1SpaceBooking'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import cas1AssignKeyWorkerFactory from './cas1AssignKeyWorker'
import newPlacementArrivalFactory from './newPlacementArrival'

export {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  appealFactory,
  apAreaFactory,
  apCharacteristicPairFactory,
  applicationFactory,
  applicationSummaryFactory,
  applicationTimelineFactory,
  arrivalFactory,
  assessmentTaskFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  bedSummaryFactory,
  bedDetailFactory,
  bookingSummaryFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  bookingAppealTask,
  bookingFactory,
  bookingExtensionFactory,
  bookingPremisesSummaryFactory,
  bookingNotMadeFactory,
  cancellationFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremisesSummaryFactory,
  cas1ReferenceDataFactory,
  cas1SpaceBookingDatesFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  cas1AssignKeyWorkerFactory,
  newPlacementArrivalFactory,
  clarificationNoteFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  cruManagementAreaFactory,
  dateChangeFactory,
  dateCapacityFactory,
  departureFactory,
  documentFactory,
  extendedPremisesSummaryFactory,
  newPlacementRequestBookingFactory,
  newPlacementRequestBookingConfirmationFactory,
  newCancellationFactory,
  newAppealFactory,
  noteFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  outOfServiceBedFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedRevisionFactory,
  newOutOfServiceBedFactory,
  paginatedResponseFactory,
  personFactory,
  personalTimelineFactory,
  placementApplicationFactory,
  placementApplicationTaskFactory,
  placementApplicationDecisionEnvelopeFactory,
  placementDatesFactory,
  placementRequestFactory,
  placementRequestWithFullPersonFactory,
  placementRequestDetailFactory,
  placementRequestTaskFactory,
  premisesFactory,
  premisesBookingFactory,
  premisesSummaryFactory,
  prisonCaseNotesFactory,
  probationRegionFactory,
  reallocationFactory,
  referenceDataFactory,
  restrictedPersonFactory,
  requestForPlacementFactory,
  risksFactory,
  roshSummaryFactory,
  staffMemberFactory,
  taskFactory,
  taskWrapperFactory,
  tierEnvelopeFactory,
  timelineEventFactory,
  userFactory,
  userSummaryFactory,
  userDetailsFactory,
  userWithWorkloadFactory,
  withdrawableFactory,
  cancellationReasonFactory,
  newSpaceBookingFactory,
  premisesSearchResultSummaryFactory,
  spaceBookingFactory,
  spaceBookingRequirementsFactory,
  spaceCategoryAvailabilityFactory,
  spaceSearchParametersFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultFactory,
  spaceSearchResultsFactory,
}
