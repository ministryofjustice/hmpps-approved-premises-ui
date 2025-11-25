import { ApprovedPremisesApplicationStatus as ApplicationStatus } from '../../@types/shared'
import { StatusTag, StatusTagOptions } from '../statusTag'

export const APPLICATION_SUITABLE = 'Application suitable' as const

export const applicationSuitableStatuses: ReadonlyArray<ApplicationStatus> = [
  'awaitingPlacement',
  'pendingPlacementRequest',
  'placementAllocated',
]
export const withdrawableStatuses: ReadonlyArray<ApplicationStatus> = [
  'started',
  'rejected',
  'inapplicable',
  'awaitingAssesment',
  'unallocatedAssesment',
  'assesmentInProgress',
  'requestedFurtherInformation',
  'pendingPlacementRequest',
]
export const expirableStatuses: ReadonlyArray<ApplicationStatus> = ['awaitingPlacement', 'placementAllocated']

/**
 * If there are any applications of any of these statuses against a CRN, a new application cannot be created for that CRN
 */
export const statusesLimitedToOne: Array<ApplicationStatus> = [
  'started',
  'awaitingAssesment',
  'unallocatedAssesment',
  'assesmentInProgress',
  'awaitingPlacement',
  'placementAllocated',
  'requestedFurtherInformation',
  'pendingPlacementRequest',
]

/**
 * The states of an application for which a new placement request may be created against it
 */
export const placementRequestAllowed: Array<ApplicationStatus> = [
  'awaitingPlacement',
  'placementAllocated',
  'pendingPlacementRequest',
]

export class ApplicationStatusTag extends StatusTag<ApplicationStatus> {
  static readonly statuses: Record<ApplicationStatus, string> = {
    started: 'Not submitted',
    rejected: 'Application rejected',
    awaitingAssesment: 'Awaiting assessment',
    unallocatedAssesment: 'Unallocated assessment',
    assesmentInProgress: 'Assessment in progress',
    awaitingPlacement: APPLICATION_SUITABLE,
    placementAllocated: APPLICATION_SUITABLE,
    inapplicable: 'Application inapplicable',
    withdrawn: 'Application withdrawn',
    requestedFurtherInformation: 'Further information requested',
    pendingPlacementRequest: APPLICATION_SUITABLE,
    expired: 'Expired application',
  }

  static readonly colours: Record<ApplicationStatus, string> = {
    started: 'blue',
    rejected: 'red',
    awaitingAssesment: 'blue',
    unallocatedAssesment: 'blue',
    assesmentInProgress: 'blue',
    awaitingPlacement: 'blue',
    placementAllocated: 'blue',
    inapplicable: 'red',
    withdrawn: 'red',
    requestedFurtherInformation: 'yellow',
    pendingPlacementRequest: 'blue',
    expired: 'red',
  }

  constructor(status: ApplicationStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: ApplicationStatusTag.statuses,
      colours: ApplicationStatusTag.colours,
    })
  }
}

export class ApplicationStatusShortTag extends StatusTag<ApplicationStatus> {
  static readonly statuses: Record<ApplicationStatus, string> = {
    started: 'Not submitted',
    rejected: 'Rejected',
    awaitingAssesment: 'Assessment',
    unallocatedAssesment: 'Assessment',
    assesmentInProgress: 'Assessment',
    awaitingPlacement: 'Suitable',
    placementAllocated: 'Suitable',
    inapplicable: 'Inapplicable',
    withdrawn: 'Withdrawn',
    requestedFurtherInformation: 'Information request',
    pendingPlacementRequest: 'Suitable',
    expired: 'Expired',
  }

  static readonly colours: Record<ApplicationStatus, string> = {
    started: 'blue',
    rejected: 'red',
    awaitingAssesment: 'blue',
    unallocatedAssesment: 'blue',
    assesmentInProgress: 'blue',
    awaitingPlacement: 'green',
    placementAllocated: 'green',
    inapplicable: 'red',
    withdrawn: 'red',
    requestedFurtherInformation: 'yellow',
    pendingPlacementRequest: 'green',
    expired: 'red',
  }

  constructor(status: ApplicationStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: ApplicationStatusShortTag.statuses,
      colours: ApplicationStatusShortTag.colours,
    })
  }
}
