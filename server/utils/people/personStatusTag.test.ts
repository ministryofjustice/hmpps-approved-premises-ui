import { PersonStatus } from '../../@types/shared'
import { PersonStatusTag } from './personStatusTag'

describe('Person Statuses', () => {
  const statuses = Object.keys(PersonStatusTag.statuses) as ReadonlyArray<PersonStatus>

  statuses.forEach(status => {
    it(`returns the correct tag for each person with a status of ${status}`, () => {
      expect(new PersonStatusTag(status).html()).toEqual(
        `<strong class="govuk-tag " data-cy-status="${status}" >${PersonStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
