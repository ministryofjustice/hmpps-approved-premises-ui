import {
  assessmentTaskFactory,
  placementApplicationTaskFactory,
  placementRequestTaskFactory,
  taskFactory,
} from '../../testutils/factories'
import {
  allocatedTableRows,
  allocationCell,
  getTaskType,
  nameAnchorCell,
  statusBadge,
  statusCell,
  taskParams,
  taskTypeCell,
  tasksTabItems,
  tasksTableHeader,
  tasksTableRows,
  unallocatedTableRows,
} from './listTable'
import { kebabCase, linkTo } from '../utils'
import { sortHeader } from '../sortHeader'
import { TaskSortField } from '../../@types/shared'
import paths from '../../paths/tasks'
import { daysUntilDueCell } from '../tableUtils'

describe('table', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('allocatedTableRows', () => {
    describe('when all the optional task properties are populated', () => {
      it('returns an array of table rows', () => {
        const task = taskFactory.build()

        expect(allocatedTableRows([task])).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task, 'task--index__warning'),
            {
              text: task?.allocatedToStaffMember?.name,
            },
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
            },
            {
              text: task.apArea?.name || 'No area supplied',
            },
          ],
        ])
      })

      it('returns an array of allocated table rows', () => {
        const task = taskFactory.build()

        expect(tasksTableRows([task], 'allocated')).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task, 'task--index__warning'),
            {
              text: task?.allocatedToStaffMember?.name,
            },
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
            },
            {
              text: task.apArea?.name || 'No area supplied',
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
            daysUntilDueCell(task, 'task--index__warning'),
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
            },
            { text: task.apArea?.name || 'No area supplied' },
          ],
        ])
      })

      it('returns an array of unallocated table rows', () => {
        const task = taskFactory.build()

        expect(tasksTableRows([task], 'unallocated')).toEqual([
          [
            nameAnchorCell(task),
            daysUntilDueCell(task, 'task--index__warning'),
            {
              html: statusBadge(task),
            },
            {
              html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
            },
            {
              text: task.apArea?.name,
            },
          ],
        ])
      })
    })
  })

  describe('unallocatedTableRows', () => {
    const sortBy = 'dueAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://localhost'

    it('returns an array of unallocated table headers', () => {
      expect(tasksTableHeader('unallocated', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
        sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
        {
          text: 'Task type',
        },
        {
          text: 'AP area',
        },
      ])
    })
  })

  describe('allocatedTableRows', () => {
    const sortBy = 'dueAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://localhost'

    it('returns an array of allocated table headers', () => {
      expect(tasksTableHeader('allocated', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
        sortHeader<TaskSortField>('Due', 'dueAt', sortBy, sortDirection, hrefPrefix),
        sortHeader<TaskSortField>('Allocated to', 'allocatedTo', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
        {
          text: 'Task type',
        },
        {
          text: 'AP area',
        },
      ])
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
        html: `<strong class="govuk-tag">${getTaskType(task)}</strong>`,
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

  describe('taskParams', () => {
    it('returns task parameter object with task type in correct case', () => {
      const task = taskFactory.build({ taskType: 'PlacementRequest' })
      const result = taskParams(task)

      expect(result).toEqual({
        id: task.id,
        taskType: 'placement-request',
      })
    })
  })

  describe('getTaskType', () => {
    ;[
      { task: placementRequestTaskFactory.build(), expectedTaskType: 'Match request', taskType: 'Placement Request' },
      {
        task: placementApplicationTaskFactory.build(),
        expectedTaskType: 'Request for placement',
        taskType: 'Placement Application',
      },
      {
        task: assessmentTaskFactory.build({ createdFromAppeal: false }),
        expectedTaskType: 'Assessment',
        taskType: 'Assessment',
      },
      {
        task: assessmentTaskFactory.build({ createdFromAppeal: true }),
        expectedTaskType: 'Assessment (Appealed)',
        taskType: 'Appealed Assessment',
      },
    ].forEach(args => {
      it(`should return '${args.expectedTaskType}' for a task of type '${args.taskType}'`, () => {
        const result = getTaskType(args.task)

        expect(result).toEqual(args.expectedTaskType)
      })
    })
  })

  describe('tasksTabItems', () => {
    it('returns tasks tab items when active tab and area not present', () => {
      expect(tasksTabItems()).toEqual([
        {
          text: 'Allocated',
          active: true,
          href: '/tasks?allocatedFilter=allocated',
        },
        {
          text: 'Unallocated',
          active: false,
          href: '/tasks?allocatedFilter=unallocated',
        },
      ])
    })

    it('returns tasks tab items when active tab and area present', () => {
      expect(tasksTabItems('allocated', 'areaId')).toEqual([
        {
          text: 'Allocated',
          active: true,
          href: '/tasks?allocatedFilter=allocated&area=areaId',
        },
        {
          text: 'Unallocated',
          active: false,
          href: '/tasks?allocatedFilter=unallocated&area=areaId',
        },
      ])
    })

    it('returns tasks tab items when active tab unallocated and area present', () => {
      expect(tasksTabItems('unallocated', 'areaId')).toEqual([
        {
          text: 'Allocated',
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId',
        },
        {
          text: 'Unallocated',
          active: true,
          href: '/tasks?allocatedFilter=unallocated&area=areaId',
        },
      ])
    })
  })
})
