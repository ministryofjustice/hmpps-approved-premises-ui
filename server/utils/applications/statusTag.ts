import { ApprovedPremisesApplicationStatus as ApplicationStatus } from '../../@types/shared'
import { StatusTag, StatusTagOptions } from '../statusTag'

export const APPLICATION_SUITABLE = 'Application suitable' as const
export class ApplicationStatusTag extends StatusTag<ApplicationStatus> {
  static readonly statuses: Record<ApplicationStatus, string> = {
    started: 'Application started',
    submitted: 'Application submitted',
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
  }

  static readonly colours: Record<ApplicationStatus, string> = {
    started: 'blue',
    submitted: '',
    rejected: 'red',
    awaitingAssesment: 'blue',
    unallocatedAssesment: 'blue',
    assesmentInProgress: 'blue',
    awaitingPlacement: 'blue',
    placementAllocated: 'pink',
    inapplicable: 'red',
    withdrawn: 'red',
    requestedFurtherInformation: 'yellow',
    pendingPlacementRequest: 'blue',
  }

  constructor(status: ApplicationStatus, options?: StatusTagOptions) {
    super(status, options, {
      statuses: ApplicationStatusTag.statuses,
      colours: ApplicationStatusTag.colours,
    })
  }
}
