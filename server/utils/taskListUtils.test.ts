import { when } from 'jest-when'
import { TaskStatus as TaskListStatus, TaskNames, TaskWithStatus } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { applicationFactory, assessmentFactory } from '../testutils/factories'
import { TaskListStatusTag, taskLink } from './taskListUtils'
import { isApplicableTier, isFullPerson } from './personUtils'

jest.mock('./personUtils')

beforeEach(() => {
  when(isFullPerson as jest.MockedFunction<typeof isFullPerson>)
    .calledWith(expect.anything())
    .mockReturnValue(true)
  when(isApplicableTier as jest.Mock)
    .calledWith(expect.anything(), expect.anything())
    .mockReturnValue(true)
})
afterEach(() => {
  jest.resetAllMocks()
})
describe('taskListUtils', () => {
  const task = {
    id: 'second-task' as TaskNames,
    title: 'Second Task',
    pages: { foo: 'bar', bar: 'baz' },
    status: 'in_progress',
  } as TaskWithStatus

  describe('taskLink', () => {
    describe('with an application', () => {
      const application = applicationFactory.build({ id: 'some-uuid' })

      it('should return a link to a task the task can be started', () => {
        task.status = 'in_progress'

        expect(taskLink(task, application)).toEqual(
          `<a href="${applyPaths.applications.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
        )
      })

      it('should return a link to the first completed question page if it exists', () => {
        task.status = 'in_progress'
        application.data = { 'second-task': { foo: { some: 'response' } } }

        expect(taskLink(task, application)).toEqual(
          `<a href="${applyPaths.applications.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
        )

        application.data = { 'second-task': { bar: { some: 'response' } } }
        expect(taskLink(task, application)).toEqual(
          `<a href="${applyPaths.applications.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'bar',
          })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
        )
      })

      it('should return the task name when the task cannot be started', () => {
        task.status = 'cannot_start'

        expect(taskLink(task, application)).toEqual(`Second Task`)
      })

      it('should handle when data is undefined', () => {
        task.status = 'in_progress'
        application.data = undefined

        expect(taskLink(task, application)).toEqual(
          `<a href="${applyPaths.applications.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
        )
      })

      it('should return a link of is-exceptional-case if page is basic information and risk tier not applicable', () => {
        const basicTask = {
          id: 'basic-information',
          title: 'Basic Information',
          pages: { foo: 'bar', bar: 'baz' },
          status: 'in_progress',
        } as TaskWithStatus
        ;(isApplicableTier as jest.MockedFunction<typeof isApplicableTier>).mockReturnValue(false)

        expect(taskLink(basicTask, application)).toEqual(
          `<a href="${applyPaths.applications.pages.show({
            id: application.id,
            task: 'basic-information',
            page: 'is-exceptional-case',
          })}" aria-describedby="eligibility-basic-information" data-cy-task-name="basic-information">Basic Information</a>`,
        )
      })
    })

    describe('with an assessment', () => {
      const application = assessmentFactory.build({ id: 'some-uuid' })

      it('should return a link to a task the task can be started', () => {
        task.status = 'in_progress'

        expect(taskLink(task, application)).toEqual(
          `<a href="${assessPaths.assessments.pages.show({
            id: 'some-uuid',
            task: 'second-task',
            page: 'foo',
          })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
        )
      })

      it('should return the task name when the task cannot be started', () => {
        task.status = 'cannot_start'

        expect(taskLink(task, application)).toEqual(`Second Task`)
      })
    })
  })
})

describe('Tasklist Statuses', () => {
  const statuses = Object.keys(TaskListStatusTag.statuses) as ReadonlyArray<TaskListStatus>

  statuses.forEach(status => {
    it(`returns the correct tag for each person with a status of ${status}`, () => {
      const id = 'id' as TaskNames
      expect(new TaskListStatusTag(status, id).html()).toEqual(
        `<strong class="govuk-tag govuk-tag--${TaskListStatusTag.colours[status]} app-task-list__tag" data-cy-status="${status}" id="${id}-status">${TaskListStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
