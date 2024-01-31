/* istanbul ignore file */

import { ApprovedPremisesApplication as Application, Task } from '../../@types/shared'
import { SummaryListItem } from '../../@types/ui'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getApplicationType } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import { nameOrPlaceholderCopy } from '../personUtils'
import { allocatedTableRows, tasksTableHeader, tasksTableRows, unallocatedTableRows } from './listTable'
import { userTableHeader, userTableRows } from './usersTable'

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

const taskSummary = (task: Task, application: Application): Array<SummaryListItem> => {
  const arrivalDate = arrivalDateFromApplication(application)

  const summary = [
    {
      key: {
        text: 'Name',
      },
      value: {
        text: nameOrPlaceholderCopy(application.person, `LAO: ${application.person.crn}`, true),
      },
    },
    {
      key: {
        text: 'CRN',
      },
      value: {
        text: application.person.crn,
      },
    },
    {
      key: {
        text: 'Arrival date',
      },
      value: {
        text: arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate) : 'Not provided',
      },
    },
    {
      key: {
        text: 'Application Type',
      },
      value: {
        text: getApplicationType(application),
      },
    },
    {
      key: { text: 'Currently allocated to' },
      value: { text: task?.allocatedToStaffMember ? task.allocatedToStaffMember.name : 'Unallocated' },
    },
  ]

  return summary
}

export {
  taskSummary,
  allocatedTableRows,
  groupByAllocation,
  unallocatedTableRows,
  tasksTableHeader,
  tasksTableRows,
  userTableHeader,
  userTableRows,
}
