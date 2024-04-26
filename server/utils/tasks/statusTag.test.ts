import { TaskStatus } from '../../@types/shared'
import { TaskStatusTag } from './statusTag'

describe('statusTag', () => {
  const statuses = Object.keys(TaskStatusTag.statuses) as ReadonlyArray<TaskStatus>

  statuses.forEach(status => {
    it(`returns the correct tag for each TaskStatusTag with a status of ${status}`, () => {
      expect(new TaskStatusTag(status as never).html()).toEqual(
        `<strong class="govuk-tag govuk-tag--${TaskStatusTag.colours[status]} " data-cy-status="${status}" >${TaskStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
