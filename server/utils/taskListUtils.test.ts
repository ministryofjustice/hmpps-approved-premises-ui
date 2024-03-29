import { TaskWithStatus } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import { applicationFactory, assessmentFactory } from '../testutils/factories'
import { statusTag, taskLink } from './taskListUtils'

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

  describe('statusTag', () => {
    it('returns a an in progress tag when the task is in progress', () => {
      task.status = 'in_progress'

      expect(statusTag(task)).toEqual(
        '<strong class="govuk-tag govuk-tag--blue app-task-list__tag" id="second-task-status">In progress</strong>',
      )
    })

    it('returns an in progress tag when the task is has not been started', () => {
      task.status = 'in_progress'

      expect(statusTag(task)).toEqual(
        '<strong class="govuk-tag govuk-tag--blue app-task-list__tag" id="second-task-status">In progress</strong>',
      )
    })

    it('returns a not started tag when the task is has not been started', () => {
      task.status = 'not_started'

      expect(statusTag(task)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="second-task-status">Not started</strong>',
      )
    })

    it('returns a cannot start tag when the task cannot be started', () => {
      task.status = 'cannot_start'

      expect(statusTag(task)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="second-task-status">Cannot start yet</strong>',
      )
    })
  })
})
