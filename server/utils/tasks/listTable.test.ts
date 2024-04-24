import {
  assessmentTaskFactory,
  placementApplicationTaskFactory,
  placementRequestTaskFactory,
  taskFactory,
} from '../../testutils/factories'
import {
  allocatedTableRows,
  allocationCell,
  completedAtDateCell,
  completedByCell,
  completedTableRows,
  decisionCell,
  getDecisionOutcome,
  getTaskType,
  nameAnchorCell,
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
import { TaskStatusTag } from './statusTag'

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
              html: new TaskStatusTag(task.status).html(),
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
              html: new TaskStatusTag(task.status).html(),
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
              html: new TaskStatusTag(task.status).html(),
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
              html: new TaskStatusTag(task.status).html(),
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
        html: new TaskStatusTag(task.status).html(),
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
      expect(tasksTabItems('/tasks')).toEqual([
        {
          text: 'Allocated',
          active: true,
          href: '/tasks?allocatedFilter=allocated&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: false,
          href: '/tasks?allocatedFilter=unallocated&activeTab=unallocated',
        },
        {
          active: false,
          href: '/tasks?allocatedFilter=allocated&activeTab=completed',
          text: 'Completed',
        },
      ])
    })

    it('returns tasks tab items when active tab and area present', () => {
      expect(tasksTabItems('/tasks?allocatedFilter=allocated&area=areaId', 'allocated')).toEqual([
        {
          text: 'Allocated',
          active: true,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: false,
          href: '/tasks?allocatedFilter=unallocated&area=areaId&activeTab=unallocated',
        },
        {
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=completed',
          text: 'Completed',
        },
      ])
    })

    it('returns tasks tab items when active tab unallocated and area present', () => {
      expect(tasksTabItems('/tasks?allocatedFilter=allocated&area=areaId', 'unallocated')).toEqual([
        {
          text: 'Allocated',
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: true,
          href: '/tasks?allocatedFilter=unallocated&area=areaId&activeTab=unallocated',
        },
        {
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=completed',
          text: 'Completed',
        },
      ])
    })

    it('returns tasks tab items when active tab completed and area present', () => {
      expect(tasksTabItems('/tasks?allocatedFilter=allocated&area=areaId', 'completed')).toEqual([
        {
          text: 'Allocated',
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: false,
          href: '/tasks?allocatedFilter=unallocated&area=areaId&activeTab=unallocated',
        },
        {
          active: true,
          href: '/tasks?allocatedFilter=allocated&area=areaId&activeTab=completed',
          text: 'Completed',
        },
      ])
    })

    it('handles multiple arguments', () => {
      expect(tasksTabItems('/tasks?allocatedFilter=allocated&area=areaId&foo=bar&abc=123', 'unallocated')).toEqual([
        {
          text: 'Allocated',
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&foo=bar&abc=123&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: true,
          href: '/tasks?allocatedFilter=unallocated&area=areaId&foo=bar&abc=123&activeTab=unallocated',
        },
        {
          active: false,
          href: '/tasks?allocatedFilter=allocated&area=areaId&foo=bar&abc=123&activeTab=completed',
          text: 'Completed',
        },
      ])
    })

    it('Removes the allocatedToUserId from the unallocated tab', () => {
      expect(tasksTabItems('/tasks?allocatedFilter=allocated&allocatedToUserId=123', 'unallocated')).toEqual([
        {
          text: 'Allocated',
          active: false,
          href: '/tasks?allocatedFilter=allocated&allocatedToUserId=123&activeTab=allocated',
        },
        {
          text: 'Unallocated',
          active: true,
          href: '/tasks?allocatedFilter=unallocated&activeTab=unallocated',
        },
        {
          active: false,
          href: '/tasks?allocatedFilter=allocated&allocatedToUserId=123&activeTab=completed',
          text: 'Completed',
        },
      ])
    })
  })

  describe('completedTableRows', () => {
    it('returns an array of completed table rows', () => {
      const task = taskFactory.build()

      expect(completedTableRows([task])).toEqual([
        [
          nameAnchorCell(task),
          completedAtDateCell(task),
          completedByCell(task),
          taskTypeCell(task),
          decisionCell(task),
        ],
      ])
    })

    it('returns an array of completed task table rows', () => {
      const task = taskFactory.build()

      expect(tasksTableRows([task], 'completed')).toEqual([
        [
          nameAnchorCell(task),
          completedAtDateCell(task),
          completedByCell(task),
          taskTypeCell(task),
          decisionCell(task),
        ],
      ])
    })
  })

  describe('tasksTableHeader', () => {
    const sortBy = 'dueAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://localhost'

    it('returns an array of completed table headers', () => {
      expect(tasksTableHeader('completed', sortBy, sortDirection, hrefPrefix)).toEqual([
        sortHeader<TaskSortField>('Person', 'person', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Completed at',
        },
        {
          text: 'Completed by',
        },
        {
          text: 'Task type',
        },
        {
          text: 'Decision',
        },
      ])
    })
  })

  describe('getDecisionOutcome', () => {
    it('returns assessment decision outcome rejected', () => {
      const task = assessmentTaskFactory.build({ outcome: 'rejected' })
      expect(getDecisionOutcome(task)).toEqual('Rejected')
    })
    it('returns placement application decision outcome withdrawn_by_pp', () => {
      const task = placementApplicationTaskFactory.build({ outcome: 'withdrawn_by_pp' })
      expect(getDecisionOutcome(task)).toEqual('Withdrawn by probation practitioner')
    })
    it('returns placement application decision outcome withdrawn_by_pp', () => {
      const task = placementRequestTaskFactory.build({ outcome: 'matched' })
      expect(getDecisionOutcome(task)).toEqual('Matched')
    })
  })
})
