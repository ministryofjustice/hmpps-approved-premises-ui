import { taskFactory } from '../../testutils/factories'
import { statusBadge } from './statusBadge'

describe('statusBadge', () => {
  it('returns the "complete" status tag', () => {
    const completedTask = taskFactory.build({ status: 'complete' })
    expect(statusBadge(completedTask)).toEqual(`<strong class="govuk-tag govuk-tag--green">Complete</strong>`)
  })

  it('returns the "not started" status tag', () => {
    const notStartedTask = taskFactory.build({ status: 'not_started' })
    expect(statusBadge(notStartedTask)).toEqual(`<strong class="govuk-tag govuk-tag--blue">Not started</strong>`)
  })

  it('returns the "in_progress" status tag', () => {
    const inProgressTask = taskFactory.build({ status: 'in_progress' })
    expect(statusBadge(inProgressTask)).toEqual(`<strong class="govuk-tag govuk-tag--grey">In progress</strong>`)
  })

  it('returns the "info_requested" status tag', () => {
    const inProgressTask = taskFactory.build({ status: 'info_requested' })
    expect(statusBadge(inProgressTask)).toEqual(`<strong class="govuk-tag govuk-tag--yellow">Info requested</strong>`)
  })
})
