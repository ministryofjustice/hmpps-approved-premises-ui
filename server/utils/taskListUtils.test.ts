import { TaskStatus as TaskListStatus, TaskWithStatus } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { applicationFactory, assessmentFactory } from '../testutils/factories'
import { TaskListStatusTag, taskLink } from './taskListUtils'

describe('taskListUtils', () => {
  const task = {
    id: 'second-task',
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
      const id = 'id'
      expect(new TaskListStatusTag(status, id).html()).toEqual(
        `<strong class="govuk-tag govuk-tag--${TaskListStatusTag.colours[status]} app-task-list__tag " data-cy-status="${status}" id="${id}-status">${TaskListStatusTag.statuses[status]}</strong>`,
      )
    })
  })
})
