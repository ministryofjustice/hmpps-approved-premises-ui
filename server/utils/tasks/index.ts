/* istanbul ignore file */

import { ApprovedPremisesApplication as Application, Task } from '../../@types/shared'
import { SelectOption, SummaryListItem, TaskSearchQualification } from '../../@types/ui'
import { arrivalDateFromApplication } from '../applications/arrivalDateFromApplication'
import { getApplicationType } from '../applications/utils'
import { DateFormats } from '../dateUtils'
import { displayName } from '../personUtils'
import {
  allocatedTableRows,
  completedTableHeader,
  completedTableRows,
  taskParams,
  tasksTabItems,
  tasksTableHeader,
  tasksTableRows,
  unallocatedTableRows,
} from './listTable'
import { userTableHeader, userTableRows } from './usersTable'
import paths from '../../paths/apply'
import { isPlacementApplicationTask } from './assertions'
import { qualificationDictionary } from '../users'

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

const getArrivalDate = (task: Task, application: Application) => {
  if (isPlacementApplicationTask(task) && task.placementDates && task.placementDates.length > 0) {
    return task.placementDates[0].expectedArrival
  }

  return arrivalDateFromApplication(application)
}

const getFormattedNameAndEmail = (name: string, email?: string) => {
  if (email) {
    return `${name} (${email})`
  }

  return name
}

const taskSummary = (task: Task, application: Application): Array<SummaryListItem> => {
  const arrivalDate = getArrivalDate(task, application)
  const { applicantUserDetails, caseManagerUserDetails, caseManagerIsNotApplicant } = application

  const summary = [
    {
      key: {
        text: 'Name',
      },
      value: {
        text: displayName(application.person, { laoSuffix: true }),
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
        text: 'Application type',
      },
      value: {
        text: getApplicationType(application),
      },
      actions: {
        items: [
          {
            href: `${paths.applications.show({ id: application.id })}?tab=timeline`,
            text: 'View timeline',
          },
        ],
      },
    },
    {
      key: {
        text: 'AP area',
      },
      value: {
        text: application.apArea?.name,
      },
    },
    {
      key: { text: 'Currently allocated to' },
      value: { text: task?.allocatedToStaffMember ? task.allocatedToStaffMember.name : 'Unallocated' },
    },
  ]

  if (applicantUserDetails) {
    summary.push({
      key: { text: 'Applicant' },
      value: { text: getFormattedNameAndEmail(applicantUserDetails.name, applicantUserDetails.email) },
    })
  }

  if (caseManagerIsNotApplicant && caseManagerUserDetails) {
    summary.push({
      key: { text: 'Case manager' },
      value: { text: getFormattedNameAndEmail(caseManagerUserDetails.name, caseManagerUserDetails.email) },
    })
  }

  summary.push({
    key: { text: 'AP gender' },
    value: { text: application.isWomensApplication ? 'Women' : 'Men' },
  })

  if (task.probationDeliveryUnit) {
    summary.push({
      key: { text: 'Applicant PDU' },
      value: { text: task.probationDeliveryUnit.name },
    })
  }

  return summary
}

const userQualificationsSelectOptions = (
  selectedOption: TaskSearchQualification | undefined | null,
): Array<SelectOption> => {
  const options = Object.keys(qualificationDictionary)
    .filter(key => key !== 'lao')
    .map(qualification => ({
      text: qualificationDictionary[qualification],
      value: qualification,
      selected: qualification === selectedOption,
    }))

  options.unshift({
    text: 'All qualifications',
    value: '',
    selected: !selectedOption,
  })

  return options
}

export {
  taskSummary,
  allocatedTableRows,
  groupByAllocation,
  unallocatedTableRows,
  taskParams,
  tasksTableHeader,
  tasksTableRows,
  userTableHeader,
  userTableRows,
  tasksTabItems,
  userQualificationsSelectOptions,
  completedTableHeader,
  completedTableRows,
  getFormattedNameAndEmail,
}
