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
import bedDetailFactory, { apCharacteristicPairFactory } from './bedDetail'
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
import premisesFactory from './premises'
import premisesSummaryFactory from './premisesSummary'
import prisonCaseNotesFactory from './prisonCaseNotes'
import reallocationFactory from './reallocation'
import referenceDataFactory, {
  apAreaFactory,
  departureReasonFactory,
  nonArrivalReasonsFactory,
  probationRegionFactory,
} from './referenceData'
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
import cas1PremisesSearchResultSummaryFactory from './cas1PremisesSearchResultSummary'
import spaceBookingRequirementsFactory from './spaceBookingRequirements'
import spaceSearchParametersFactory from './spaceSearchParameters'
import spaceSearchResultFactory from './spaceSearchResult'
import spaceSearchResultsFactory from './spaceSearchResults'
import cas1PremisesFactory from './cas1Premises'
import cas1PremisesBasicSummaryFactory from './cas1PremisesBasicSummary'
import cas1PremiseCapacityFactory, { cas1PremiseCapacityForDayFactory } from './cas1PremiseCapacity'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
import cas1SpaceBookingDaySummaryFactory from './cas1SpaceBookingDaySummary'
import cas1SpaceBookingFactory from './cas1SpaceBooking'
import cas1SpaceBookingDatesFactory from './cas1SpaceBookingDates'
import cas1AssignKeyWorkerFactory from './cas1AssignKeyWorker'
import cas1NonArrivalFactory from './cas1NonArrival'
import cas1NewArrivalFactory from './cas1NewArrival'
import cas1NewDepartureFactory from './cas1NewDeparture'
import cas1SpaceBookingDepartureFactory from './cas1SpaceBookingDeparture'
import cas1KeyworkerAllocationFactory from './cas1KeyworkerAllocation'
import cas1NewSpaceBookingCancellationFactory from './cas1NewSpaceBookingCancellation'
import cas1PremisesDaySummaryFactory from './cas1PremisesDaySummary'
import cas1OutOfServiceBedSummaryFactory from './cas1OutOfServiceBedSummary'
import spaceSearchStateFactory from './spaceSearchState'

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
  bookingFactory,
  bookingExtensionFactory,
  bookingPremisesSummaryFactory,
  bookingNotMadeFactory,
  cancellationFactory,
  cas1OutOfServiceBedSummaryFactory,
  cas1PremisesBasicSummaryFactory,
  cas1PremiseCapacityFactory,
  cas1PremiseCapacityForDayFactory,
  cas1PremisesFactory,
  cas1PremisesDaySummaryFactory,
  cas1ReferenceDataFactory,
  cas1SpaceBookingDatesFactory,
  cas1SpaceBookingDepartureFactory,
  cas1SpaceBookingFactory,
  cas1SpaceBookingSummaryFactory,
  cas1SpaceBookingDaySummaryFactory,
  cas1AssignKeyWorkerFactory,
  cas1NewArrivalFactory,
  cas1NewDepartureFactory,
  cas1NewSpaceBookingCancellationFactory,
  cas1NonArrivalFactory,
  cas1KeyworkerAllocationFactory,
  clarificationNoteFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  cruManagementAreaFactory,
  dateChangeFactory,
  dateCapacityFactory,
  departureFactory,
  departureReasonFactory,
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
  nonArrivalReasonsFactory,
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
  cas1PremisesSearchResultSummaryFactory,
  spaceBookingRequirementsFactory,
  spaceSearchParametersFactory,
  spaceSearchResultFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
}
