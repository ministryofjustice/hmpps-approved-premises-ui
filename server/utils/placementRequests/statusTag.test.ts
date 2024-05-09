import { RequestForPlacementStatus } from '../../@types/shared'
import { RequestForPlacementStatusTag } from './statusTag'

describe('RequestForPlacementStatusTag', () => {
  const statuses = Object.keys(RequestForPlacementStatusTag.statuses) as ReadonlyArray<RequestForPlacementStatus>

  statuses.forEach(status => {
    it(`returns the correct tag with a status of ${status}`, () => {
      expect(new RequestForPlacementStatusTag(status).html()).toEqual(
        `<strong class="govuk-tag govuk-tag--${RequestForPlacementStatusTag.colours[status]} " data-cy-status="${status}" >${RequestForPlacementStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
