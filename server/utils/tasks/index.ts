import { Task } from '../../@types/shared'
import * as tableUtils from './table'

type GroupedTasks = {
  allocated: Array<Task>
  unallocated: Array<Task>
}

const groupByAllocation = (tasks: Array<Task>) => {
  const result: GroupedTasks = { allocated: [], unallocated: [] }

  tasks.forEach(task => {
    if (task.allocatedToStaffMember) {
      result.allocated.push(task)
    } else {
      result.unallocated.push(task)
    }
  })

  return result
}

export { groupByAllocation, tableUtils }
