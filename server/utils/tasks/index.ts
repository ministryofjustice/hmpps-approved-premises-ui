/* istanbul ignore file */

import { ApprovedPremisesApplication as Application, Task, UserQualification } from '../../@types/shared'
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
import { summaryListItem } from '../formUtils'

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
    summaryListItem('Name', displayName(application.person, { laoSuffix: true })),
    summaryListItem('CRN', application.person.crn),
    summaryListItem('Arrival date', arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate) : 'Not provided'),
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
    summaryListItem('AP area', application.apArea?.name),
    summaryListItem(
      'Currently allocated to',
      task?.allocatedToStaffMember ? task.allocatedToStaffMember.name : 'Unallocated',
    ),
  ]

  if (applicantUserDetails) {
    summary.push(
      summaryListItem('Applicant', getFormattedNameAndEmail(applicantUserDetails.name, applicantUserDetails.email)),
    )
  }

  if (caseManagerIsNotApplicant && caseManagerUserDetails) {
    summary.push(
      summaryListItem(
        'Case manager',
        getFormattedNameAndEmail(caseManagerUserDetails.name, caseManagerUserDetails.email),
      ),
    )
  }

  summary.push(summaryListItem('AP gender', application.isWomensApplication ? 'Women' : 'Men'))

  if (task.probationDeliveryUnit) {
    summary.push(summaryListItem('Applicant PDU', task.probationDeliveryUnit.name))
  }

  return summary
}

const userQualificationsSelectOptions = (
  selectedOption: TaskSearchQualification | undefined | null,
): Array<SelectOption> => {
  const options = Object.entries(qualificationDictionary)
    .filter(([key]) => key !== 'lao')
    .map(([qualification, text]) => ({ text, value: qualification, selected: qualification === selectedOption }))

  options.unshift({
    text: 'All qualifications',
    value: '' as UserQualification,
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
