import {
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ApprovedPremisesApplicationStatus as Status,
} from '../../@types/shared'

export const applicationStatuses: Record<Status, string> = {
  started: 'Application started',
  submitted: 'Application submitted',
  rejected: 'Application rejected',
  awaitingAssesment: 'Awaiting assessment',
  unallocatedAssesment: 'Unallocated assessment',
  assesmentInProgress: 'Assessment in progress',
  awaitingPlacement: 'Awaiting placement',
  placementAllocated: 'Placement allocated',
  inapplicable: 'Application inapplicable',
  withdrawn: 'Application withdrawn',
  requestedFurtherInformation: 'Further information requested',
  pendingPlacementRequest: 'Pending placement request',
} as const

export const statusTags = (classes?: string): Record<Status, string> => {
  const colours: Record<Status, string> = {
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
  } as const
  return Object.keys(applicationStatuses).reduce(
    (item, key) => {
      item[key] =
        `<strong class="govuk-tag govuk-tag--${colours[key]} ${classes?.length ? classes : ''}">${applicationStatuses[key]}</strong>`
      return item
    },
    {} as Record<Status, string>,
  )
}

export const getStatus = (application: ApplicationSummary, classes?: string) => {
  return statusTags(classes)[application.status]
}
