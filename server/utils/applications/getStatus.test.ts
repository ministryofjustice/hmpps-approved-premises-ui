import { applicationStatuses, getStatus, statusTags } from './getStatus'

import { ApprovedPremisesApplicationStatus as Status } from '../../@types/shared'
import { applicationSummaryFactory } from '../../testutils/factories'

describe('statusTags', () => {
  it('should return a list of tags for each status', () => {
    expect(statusTags()).toEqual({
      assesmentInProgress: '<strong class="govuk-tag govuk-tag--blue ">Assessment in progress</strong>',
      awaitingAssesment: '<strong class="govuk-tag govuk-tag--blue ">Awaiting assessment</strong>',
      awaitingPlacement: '<strong class="govuk-tag govuk-tag--blue ">Awaiting placement</strong>',
      inapplicable: '<strong class="govuk-tag govuk-tag--red ">Application inapplicable</strong>',
      placementAllocated: '<strong class="govuk-tag govuk-tag--pink ">Placement allocated</strong>',
      rejected: '<strong class="govuk-tag govuk-tag--red ">Application rejected</strong>',
      requestedFurtherInformation:
        '<strong class="govuk-tag govuk-tag--yellow ">Further information requested</strong>',
      started: '<strong class="govuk-tag govuk-tag--blue ">Application started</strong>',
      submitted: '<strong class="govuk-tag govuk-tag-- ">Application submitted</strong>',
      unallocatedAssesment: '<strong class="govuk-tag govuk-tag--blue ">Unallocated assessment</strong>',
      withdrawn: '<strong class="govuk-tag govuk-tag--red ">Application withdrawn</strong>',
      pendingPlacementRequest: '<strong class="govuk-tag govuk-tag--blue ">Pending placement request</strong>',
    })
  })

  it('adds the classes to the tags', () => {
    expect(statusTags('test class')).toEqual({
      assesmentInProgress: '<strong class="govuk-tag govuk-tag--blue test class">Assessment in progress</strong>',
      awaitingAssesment: '<strong class="govuk-tag govuk-tag--blue test class">Awaiting assessment</strong>',
      awaitingPlacement: '<strong class="govuk-tag govuk-tag--blue test class">Awaiting placement</strong>',
      inapplicable: '<strong class="govuk-tag govuk-tag--red test class">Application inapplicable</strong>',
      placementAllocated: '<strong class="govuk-tag govuk-tag--pink test class">Placement allocated</strong>',
      rejected: '<strong class="govuk-tag govuk-tag--red test class">Application rejected</strong>',
      requestedFurtherInformation:
        '<strong class="govuk-tag govuk-tag--yellow test class">Further information requested</strong>',
      started: '<strong class="govuk-tag govuk-tag--blue test class">Application started</strong>',
      submitted: '<strong class="govuk-tag govuk-tag-- test class">Application submitted</strong>',
      unallocatedAssesment: '<strong class="govuk-tag govuk-tag--blue test class">Unallocated assessment</strong>',
      withdrawn: '<strong class="govuk-tag govuk-tag--red test class">Application withdrawn</strong>',
      pendingPlacementRequest:
        '<strong class="govuk-tag govuk-tag--blue test class">Pending placement request</strong>',
    })
  })
})

describe('getStatus', () => {
  const statuses = Object.keys(applicationStatuses) as Array<Status>

  statuses.forEach(status => {
    it(`returns the correct tag for each an application with a status of ${status}`, () => {
      const application = applicationSummaryFactory.build({ status })
      expect(getStatus(application)).toEqual(statusTags()[status])
    })
  })
})
