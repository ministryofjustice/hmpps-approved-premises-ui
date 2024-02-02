import { taskFactory } from '../../testutils/factories'
import {
  allocatedTableRows,
  allocationCell,
  daysUntilDueCell,
  formatDaysUntilDueWithWarning,
  nameAnchorCell,
  statusBadge,
  statusCell,
  taskTypeCell,
  tasksTableHeader,
  tasksTableRows,
  unallocatedTableRows,
} from './listTable'
import { kebabCase, linkTo, sentenceCase } from '../utils'
import { DateFormats } from '../dateUtils'
import { sortHeader } from '../sortHeader'
import { TaskSortField } from '../../@types/shared'
import paths from '../../paths/tasks'

jest.mock('../dateUtils')

describe('table', () => {
  describe('allocatedTableRows', () => {
    describe('when all the optional task properties are populated', () => {
      it('returns an array of table rows', () => {
        const task = taskFactory.build()

        expect(allocatedTableRows([task])).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task),
            {
              text: task?.allocatedToStaffMember?.name,
            },
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
            },
          ],
        ])
      })

      it('returns an array of allocated table rows', () => {
        const task = taskFactory.build()

        expect(tasksTableRows([task], 'allocated')).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task),
            {
              text: task?.allocatedToStaffMember?.name,
            },
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
            },
          ],
        ])
      })
    })
  })

  describe('unallocatedTableRows', () => {
    describe('when all the optional task properties are populated', () => {
      it('returns an array of table rows', () => {
        const task = taskFactory.build()

        expect(unallocatedTableRows([task])).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task),
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
            },
          ],
        ])
      })

      it('returns an array of unallocated table rows', () => {
        const task = taskFactory.build()

        expect(tasksTableRows([task], 'unallocated')).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task),
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
            },
          ],
        ])
      })
    })
  })

  describe('unallocatedTableRows', () => {
    const sortBy = 'createdAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://localhost'

    it('returns an array of unallocated table headers', () => {
      expect(tasksTableHeader('unallocated', sortBy, sortDirection, hrefPrefix)).toEqual([
        {
          text: 'Person',
        },
        sortHeader<TaskSortField>('Due', 'createdAt', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
        {
          text: 'Task type',
        },
      ])
    })
  })

  describe('allocatedTableRows', () => {
    const sortBy = 'createdAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://localhost'

    it('returns an array of allocated table headers', () => {
      expect(tasksTableHeader('allocated', sortBy, sortDirection, hrefPrefix)).toEqual([
        {
          text: 'Person',
        },
        sortHeader<TaskSortField>('Due', 'createdAt', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Allocated to',
        },
        {
          text: 'Status',
        },
        {
          text: 'Task type',
        },
      ])
    })
  })

  describe('daysUntilDueCell', () => {
    it('returns the days until due formatted for the UI as a TableCell object', () => {
      ;(DateFormats.differenceInBusinessDays as jest.Mock).mockReturnValue(10)
      const task = taskFactory.build()
      expect(daysUntilDueCell(task)).toEqual({
        html: formatDaysUntilDueWithWarning(task),
        attributes: {
          'data-sort-value': 10,
        },
      })
    })
  })

  describe('statusCell', () => {
    it('returns the status of the task as a TableCell object', () => {
      const task = taskFactory.build()
      expect(statusCell(task)).toEqual({
        html: statusBadge(task),
      })
    })
  })

  describe('taskTypeCell', () => {
    it('returns the task type formatted for the UI as a TableCell object', () => {
      const task = taskFactory.build()
      expect(taskTypeCell(task)).toEqual({
        html: `<strong class="govuk-tag">${sentenceCase(task.taskType)}</strong>`,
      })
    })
  })

  describe('allocationCell', () => {
    it('returns the name of the staff member the task is allocated to as a TableCell object', () => {
      const task = taskFactory.build()
      expect(allocationCell(task)).toEqual({ text: task.allocatedToStaffMember?.name })
    })
  })

  describe('statusBadge', () => {
    it('returns the "complete" status tag', () => {
      const completedTask = taskFactory.build({ status: 'complete' })
      expect(statusBadge(completedTask)).toEqual('<strong class="govuk-tag">Complete</strong>')
    })

    it('returns the "not started" status tag', () => {
      const notStartedTask = taskFactory.build({ status: 'not_started' })
      expect(statusBadge(notStartedTask)).toEqual('<strong class="govuk-tag govuk-tag--yellow">Not started</strong>')
    })

    it('returns the "in_progress" status tag', () => {
      const inProgressTask = taskFactory.build({ status: 'in_progress' })
      expect(statusBadge(inProgressTask)).toEqual('<strong class="govuk-tag govuk-tag--grey">In progress</strong>')
    })
  })

  describe('formatDaysUntilDueWithWarning', () => {
    it('returns the number of days until the task is due', () => {
      ;(DateFormats.differenceInBusinessDays as jest.Mock).mockReturnValue(10)
      const task = taskFactory.build()
      expect(formatDaysUntilDueWithWarning(task)).toEqual('10 Days')
    })

    it('returns "overdue" if the task is overdue', () => {
      ;(DateFormats.differenceInBusinessDays as jest.Mock).mockReturnValue(2)
      const task = taskFactory.build()
      expect(formatDaysUntilDueWithWarning(task)).toEqual(
        `<strong class="task--index__warning">2 Days<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`,
      )
    })
  })

  describe('nameAnchorCell', () => {
    it('returns the cell when there is a person present in the task', () => {
      const task = taskFactory.build({
        taskType: 'Assessment',
      })
      expect(nameAnchorCell(task)).toEqual({
        html: linkTo(
          paths.tasks.show,
          { id: task.id, taskType: kebabCase(task.taskType) },
          {
            text: task.personName,
            attributes: { 'data-cy-taskId': task.id, 'data-cy-applicationId': task.applicationId },
          },
        ),
      })
    })
  })
})
