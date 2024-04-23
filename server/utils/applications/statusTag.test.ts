import { ApprovedPremisesApplicationStatus as ApplicationStatus } from '../../@types/shared'
import { ApplicationStatusTag } from './statusTag'

describe('ApplicationStatusTag', () => {
  const statuses = Object.keys(ApplicationStatusTag.statuses) as ReadonlyArray<ApplicationStatus>

  statuses.forEach(status => {
    it(`returns the correct tag with a status of ${status}`, () => {
      expect(new ApplicationStatusTag(status).html()).toEqual(
        `<strong class="govuk-tag govuk-tag--${ApplicationStatusTag.colours[status]} " data-cy-status="${status}" >${ApplicationStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
