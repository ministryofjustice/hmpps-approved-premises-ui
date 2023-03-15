import { groupByAllocation } from '.'
import taskFactory from '../../testutils/factories/task'
import userFactory from '../../testutils/factories/user'

describe('index', () => {
  describe('groupByAllocation', () => {
    it('should return an object with allocated and unallocated tasks', () => {
      const allocatedTask = taskFactory.build({ allocatedToStaffMember: userFactory.build() })
      const unallocatedTask = taskFactory.build({ allocatedToStaffMember: undefined })
      const tasks = [allocatedTask, unallocatedTask]

      const result = groupByAllocation(tasks)

      expect(result.allocated).toEqual([allocatedTask])
      expect(result.unallocated).toEqual([unallocatedTask])
    })
  })
})
