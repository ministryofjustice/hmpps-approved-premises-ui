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
import { bedSearchParametersFactory, bedSearchParametersUiFactory } from './bedSearchParameters'
import bedSummaryFactory from './bedSummary'
import bedDetailFactory from './bedDetail'
import {
  bedOccupancyEntryBookingUiFactory,
  bedOccupancyEntryCalendarFactory,
  bedOccupancyEntryFactory,
  bedOccupancyEntryLostBedUiFactory,
  bedOccupancyEntryOverbookingUiFactory,
  bedOccupancyEntryUiFactory,
  bedOccupancyRangeFactory,
  bedOccupancyRangeFactoryUi,
} from './bedOccupancyRange'
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
import lostBedFactory from './lostBed'
import lostBedCancellationFactory from './lostBedCancellation'
import newArrivalFactory from './newArrival'
import newBookingFactory from './newBooking'
import newCancellationFactory from './newCancellation'
import newDepartureFactory from './newDeparture'
import newLostBedFactory from './newLostBed'
import newNonArrivalFactory from './newNonArrival'
import {
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
} from './newPlacementRequestBooking'
import newAppealFactory from './newAppealFactory'
import nonArrivalFactory from './nonArrival'
import noteFactory from './noteFactory'
import oasysSectionsFactory, { roshSummaryFactory } from './oasysSections'
import oasysSelectionFactory from './oasysSelection'
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
import requestForPlacementFactory from './requestForPlacement'
import risksFactory, { tierEnvelopeFactory } from './risks'
import roomFactory from './room'
import staffMemberFactory from './staffMember'
import taskFactory from './task'
import taskWrapperFactory from './taskWrapperFactory'
import { applicationTimelineFactory, personalTimelineFactory, timelineEventFactory } from './timeline'
import userFactory, { userWithWorkloadFactory } from './user'
import userDetailsFactory from './userDetails'
import placementApplicationDecisionEnvelopeFactory from './placementApplicationDecisionEnvelope'
import premisesBookingFactory from './premisesBooking'
import bookingPremisesSummaryFactory from './bookingPremisesSummary'
import withdrawableFactory from './withdrawableFactory'

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
  bedOccupancyEntryCalendarFactory,
  bookingSummaryFactory,
  bedOccupancyEntryFactory,
  bedOccupancyEntryBookingUiFactory,
  bedOccupancyEntryLostBedUiFactory,
  bedOccupancyEntryUiFactory,
  bedOccupancyRangeFactoryUi,
  bedOccupancyRangeFactory,
  bedOccupancyEntryOverbookingUiFactory,
  bedSearchParametersFactory,
  bedSearchParametersUiFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  bookingAppealTask,
  bookingFactory,
  bookingExtensionFactory,
  bookingPremisesSummaryFactory,
  bookingNotMadeFactory,
  cancellationFactory,
  clarificationNoteFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  dateChangeFactory,
  dateCapacityFactory,
  departureFactory,
  documentFactory,
  extendedPremisesSummaryFactory,
  lostBedFactory,
  lostBedCancellationFactory,
  newArrivalFactory,
  newBookingFactory,
  newPlacementRequestBookingFactory,
  newPlacementRequestBookingConfirmationFactory,
  newCancellationFactory,
  newDepartureFactory,
  newLostBedFactory,
  newNonArrivalFactory,
  newAppealFactory,
  nonArrivalFactory,
  noteFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
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
  roomFactory,
  roshSummaryFactory,
  staffMemberFactory,
  taskFactory,
  taskWrapperFactory,
  tierEnvelopeFactory,
  timelineEventFactory,
  userFactory,
  userDetailsFactory,
  userWithWorkloadFactory,
  withdrawableFactory,
}
