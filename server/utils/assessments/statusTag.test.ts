import { AssessmentStatusTag } from './statusTag'

describe('Assessment Statuses', () => {
  it.each(['in_progress', 'not_started'] as const)(
    `returns the correct tag for an assessment with a status of %s`,
    status => {
      expect(new AssessmentStatusTag(status, 'accepted').html()).toBe(
        `<strong class="govuk-tag govuk-tag--${AssessmentStatusTag.colours[status]} " data-cy-status="${status}" >${AssessmentStatusTag.statuses[status]}</strong>`,
      )
    },
  )

  it('returns the correct tag for an assessment with a status of completed and a decision of rejected', () => {
    expect(new AssessmentStatusTag('completed', 'rejected').html()).toBe(
      `<strong class="govuk-tag govuk-tag--red " data-cy-status="rejected" >Rejected</strong>`,
    )
  })

  it('returns the correct tag for an assessment with a status of completed and a decision of accepted', () => {
    expect(new AssessmentStatusTag('completed', 'accepted').html()).toBe(
      `<strong class="govuk-tag govuk-tag--green " data-cy-status="suitable" >Suitable</strong>`,
    )
  })
})
