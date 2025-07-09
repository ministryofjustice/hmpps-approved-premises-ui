/* istanbul ignore file */

import acctAlertFactory from './acctAlert'
import activeOffenceFactory from './activeOffence'
import adjudicationFactory from './adjudication'
import appealFactory from './appealFactory'
import applicationFactory from './application'
import cas1ApplicationSummaryFactory from './cas1ApplicationSummary'
import arrivalFactory from './arrival'
import assessmentTaskFactory from './assessmentTask'
import assessmentFactory from './assessment'
import assessmentSummaryFactory from './assessmentSummary'
import bookingSummaryFactory from './placementRequestBookingSummary'
import bookingFactory from './booking'
import bookingExtensionFactory from './bookingExtension'
import bookingNotMadeFactory from './bookingNotMade'
import cancellationFactory from './cancellation'
import clarificationNoteFactory from './clarificationNote'
import contingencyPlanPartnerFactory from './contingencyPlanPartner'
import contingencyPlanQuestionsBodyFactory from './contingencyPlanQuestionsBody'
import dateChangeFactory from './dateChange'
import departureFactory from './departure'
import documentFactory from './document'
import newCancellationFactory from './newCancellation'
import {
  newPlacementRequestBookingConfirmationFactory,
  newPlacementRequestBookingFactory,
} from './newPlacementRequestBooking'
import newAppealFactory from './newAppealFactory'
import noteFactory from './noteFactory'
import cas1OASysSupportingInformationMetaDataFactory from './cas1OASysSupportingInformationQuestionMetaData'
import cas1OASysMetadataFactory from './cas1OASysMetadata'
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
import placementRequestFactory from './placementRequest'
import premisesFactory from './premises'
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
import userFactory, { userSummaryFactory, userWithWorkloadFactory } from './user'
import userDetailsFactory from './userDetails'
import placementApplicationDecisionEnvelopeFactory from './placementApplicationDecisionEnvelope'
import bookingPremisesSummaryFactory from './bookingPremisesSummary'
import withdrawableFactory from './withdrawableFactory'
import cancellationReasonFactory from './cancellationReason'
import newSpaceBookingFactory from './newSpaceBooking'
import cas1PremisesSearchResultSummaryFactory from './cas1PremisesSearchResultSummary'
import spaceSearchParametersFactory from './spaceSearchParameters'
import spaceSearchResultFactory from './spaceSearchResult'
import spaceSearchResultsFactory from './spaceSearchResults'
import cas1ApprovedPlacementAppealfactory from './cas1ApprovedPlacementAppeal'
import cas1PremisesBedSummaryFactory from './cas1PremisesBedSummary'
import cas1PremisesFactory from './cas1Premises'
import cas1PremisesBasicSummaryFactory from './cas1PremisesBasicSummary'
import cas1PremiseCapacityFactory, { cas1PremiseCapacityForDayFactory } from './cas1PremiseCapacity'
import cas1SpaceBookingSummaryFactory from './cas1SpaceBookingSummary'
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
import cas1OverbookingRangeFactory from './cas1OverbookingRange'
import spaceSearchStateFactory from './spaceSearchState'
import cas1UpdateSpaceBookingFactory from './cas1UpdateSpaceBooking'
import { applicationTimelineFactory, cas1TimelineEventFactory, personalTimelineFactory } from './cas1Timeline'
import cas1BedDetailFactory from './cas1BedDetail'
import cas1NewEmergencyTransferFactory from './cas1NewEmergencyTransfer'
import cas1ChangeRequestSummaryFactory from './cas1ChangeRequestSummary'
import cas1NewChangeRequestFactory from './cas1NewChangeRequest'
import appealSessionDataFactory from './appealSessionData'
import cas1PlacementRequestDetailFactory from './cas1PlacementRequestDetail'
import cas1ChangeRequestFactory from './cas1ChangeRequest'
import cas1RejectChangeRequestFactory from './cas1RejectChangeRequest'
import oasysQuestionFactory from './oasysQuestion'
import cas1OasysGroupFactory, { roshSummaryFactory } from './cas1OASysGroup'

export {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  appealFactory,
  appealSessionDataFactory,
  apAreaFactory,
  applicationFactory,
  cas1ApplicationSummaryFactory,
  applicationTimelineFactory,
  arrivalFactory,
  assessmentTaskFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  bookingSummaryFactory,
  bookingFactory,
  bookingExtensionFactory,
  bookingPremisesSummaryFactory,
  bookingNotMadeFactory,
  cancellationFactory,
  cas1ApprovedPlacementAppealfactory,
  cas1BedDetailFactory,
  cas1ChangeRequestSummaryFactory,
  cas1PremisesBedSummaryFactory,
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
  cas1TimelineEventFactory,
  cas1AssignKeyWorkerFactory,
  cas1ChangeRequestFactory,
  cas1NewArrivalFactory,
  cas1NewChangeRequestFactory,
  cas1NewDepartureFactory,
  cas1NewEmergencyTransferFactory,
  cas1NewSpaceBookingCancellationFactory,
  cas1NonArrivalFactory,
  cas1OverbookingRangeFactory,
  cas1PlacementRequestDetailFactory,
  cas1KeyworkerAllocationFactory,
  cas1UpdateSpaceBookingFactory,
  clarificationNoteFactory,
  contingencyPlanPartnerFactory,
  contingencyPlanQuestionsBodyFactory,
  cruManagementAreaFactory,
  dateChangeFactory,
  departureFactory,
  departureReasonFactory,
  documentFactory,
  newPlacementRequestBookingFactory,
  newPlacementRequestBookingConfirmationFactory,
  newCancellationFactory,
  newAppealFactory,
  noteFactory,
  cas1OASysSupportingInformationMetaDataFactory,
  cas1OasysGroupFactory,
  cas1OASysMetadataFactory,
  oasysQuestionFactory,
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
  premisesFactory,
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
  userFactory,
  userSummaryFactory,
  userDetailsFactory,
  userWithWorkloadFactory,
  withdrawableFactory,
  cancellationReasonFactory,
  newSpaceBookingFactory,
  cas1PremisesSearchResultSummaryFactory,
  spaceSearchParametersFactory,
  spaceSearchResultFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
  cas1RejectChangeRequestFactory,
}
