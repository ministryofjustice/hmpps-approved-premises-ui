/* istanbul ignore file */

import acctAlertFactory from './acctAlert'
import activeOffenceFactory from './activeOffence'
import adjudicationFactory from './adjudication'
import applicationFactory from './application'
import applicationSummaryFactory from './applicationSummary'
import arrivalFactory from './arrival'
import assessmentTaskFactory from './assessmentTask'
import assessmentFactory from './assessment'
import assessmentSummaryFactory from './assessmentSummary'
import { bedSearchParametersFactory, bedSearchParametersUiFactory } from './bedSearchParameters'
import bedSummaryFactory from './bedSummary'
import bedDetailFactory from './bedDetail'
import { apCharacteristicPairFactory, bedSearchResultFactory, bedSearchResultsFactory } from './bedSearchResult'
import bookingAppealTask from './bookingAppealTask'
import bookingFactory from './booking'
import bookingExtensionFactory from './bookingExtension'
import bookingNotMadeFactory from './bookingNotMade'
import cancellationFactory from './cancellation'
import clarificationNoteFactory from './clarificationNote'
import contingencyPlanPartnerFactory from './contingencyPlanPartner'
import contingencyPlanQuestionsBodyFactory from './contingencyPlanQuestionsBody'
import dateCapacityFactory from './dateCapacity'
import departureFactory from './departure'
import documentFactory from './document'
import lostBedFactory from './lostBed'
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
import nonArrivalFactory from './nonArrival'
import oasysSectionsFactory, { roshSummaryFactory } from './oasysSections'
import oasysSelectionFactory from './oasysSelection'
import personFactory from './person'
import placementApplicationFactory from './placementApplication'
import placementApplicationTaskFactory from './placementApplicationTask'
import placementDatesFactory from './placementDates'
import placementRequestFactory from './placementRequest'
import placementRequestDetailFactory from './placementRequestDetail'
import placementRequestTaskFactory from './placementRequestTask'
import premisesFactory from './premises'
import prisonCaseNotesFactory from './prisonCaseNotes'
import reallocationFactory from './reallocation'
import referenceDataFactory from './referenceData'
import risksFactory, { tierEnvelopeFactory } from './risks'
import roomFactory from './room'
import staffMemberFactory from './staffMember'
import taskFactory from './task'
import taskWrapperFactory from './taskWrapperFactory'
import userFactory from './user'
import userDetailsFactory from './userDetails'

export {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  apCharacteristicPairFactory,
  applicationFactory,
  applicationSummaryFactory,
  arrivalFactory,
  assessmentTaskFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  bedSummaryFactory,
  bedDetailFactory,
  bedSearchParametersFactory,
  bedSearchParametersUiFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  bookingAppealTask,
  bookingFactory,
  bookingExtensionFactory,
  bookingNotMadeFactory,
  cancellationFactory,
  clarificationNoteFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  dateCapacityFactory,
  departureFactory,
  documentFactory,
  lostBedFactory,
  newArrivalFactory,
  newBookingFactory,
  newPlacementRequestBookingFactory,
  newPlacementRequestBookingConfirmationFactory,
  newCancellationFactory,
  newDepartureFactory,
  newLostBedFactory,
  newNonArrivalFactory,
  nonArrivalFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  personFactory,
  placementApplicationFactory,
  placementApplicationTaskFactory,
  placementDatesFactory,
  placementRequestFactory,
  placementRequestDetailFactory,
  placementRequestTaskFactory,
  premisesFactory,
  prisonCaseNotesFactory,
  reallocationFactory,
  referenceDataFactory,
  risksFactory,
  roomFactory,
  roshSummaryFactory,
  staffMemberFactory,
  taskFactory,
  taskWrapperFactory,
  tierEnvelopeFactory,
  userFactory,
  userDetailsFactory,
}
