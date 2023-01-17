import { Task } from '../@types/ui'
import applyPaths from '../paths/apply'
import assessPaths from '../paths/assess'
import applicationFactory from '../testutils/factories/application'
import assessmentFactory from '../testutils/factories/assessment'
import { getTaskStatus, getCompleteSectionCount, taskLink } from './taskListUtils'
import Apply from '../form-pages/apply'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'first-task': {}, 'second-task': {} },
  }
})

jest.mock('../form-pages/assess', () => {
  return {
    pages: { 'first-task': {}, 'second-task': {} },
  }
})

Apply.pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('taskListUtils', () => {
  const task = {
    id: 'second-task',
    title: 'Second Task',
    pages: { foo: 'bar', bar: 'baz' },
  } as Task

  ;[
    {
      type: 'applications',
      object: applicationFactory.build({ id: 'some-uuid' }),
      paths: applyPaths.applications.pages,
    },
    {
      type: 'assessments',
      object: assessmentFactory.build({ id: 'some-uuid' }),
      paths: assessPaths.assessments.pages,
    },
  ].forEach(item => {
    describe(`with ${item.type}`, () => {
      describe('taskLink', () => {
        it('should return a link to a task when the previous task is complete', () => {
          item.object.data = { 'first-task': { foo: 'bar' } }

          expect(taskLink(task, item.object)).toEqual(
            `<a href="${item.paths.show({
              id: 'some-uuid',
              task: 'second-task',
              page: 'foo',
            })}" aria-describedby="eligibility-second-task" data-cy-task-name="second-task">Second Task</a>`,
          )
        })

        it('should return the task name when the previous task is incomplete', () => {
          item.object.data = {}

          expect(taskLink(task, item.object)).toEqual(`Second Task`)
        })

        it('should return the task name when the application has no data', () => {
          item.object.data = null

          expect(taskLink(task, item.object)).toEqual(`Second Task`)
        })
      })

      describe('getTaskStatus', () => {
        it('returns a cannot start tag when the task is incomplete and the previous task is also complete', () => {
          expect(getTaskStatus(task, item.object)).toEqual(
            '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="second-task-status">Cannot start yet</strong>',
          )
        })

        it('returns a not started tag when the task is incomplete and the previous task is complete', () => {
          item.object.data = { 'first-task': { foo: 'bar' } }

          expect(getTaskStatus(task, item.object)).toEqual(
            '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="second-task-status">Not started</strong>',
          )
        })

        it('returns a completed tag when the task is complete', () => {
          item.object.data = { 'first-task': { foo: 'bar' }, 'second-task': { foo: 'bar' } }

          expect(getTaskStatus(task, item.object)).toEqual(
            '<strong class="govuk-tag app-task-list__tag" id="second-task-status">Completed</strong>',
          )
        })

        it('works when the application has no data', () => {
          item.object.data = null

          expect(getTaskStatus(task, item.object)).toEqual(
            '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="second-task-status">Cannot start yet</strong>',
          )
        })
      })

      describe('getCompleteSectionCount', () => {
        const sections = [
          {
            title: 'Section 1',
            tasks: [
              {
                id: 'first-task',
                title: 'Basic Information',
                pages: { foo: 'bar', bar: 'baz' },
              },
              task,
            ],
          },
          {
            title: 'Section 2',
            tasks: [
              {
                id: 'something-else',
                title: 'Something Else',
                pages: { foo: 'bar', bar: 'baz' },
              },
            ],
          },
        ]

        it('returns zero when no sections are completed', () => {
          item.object.data = {}

          expect(getCompleteSectionCount(sections, item.object)).toEqual(0)
        })

        it('returns zero when a section is part completed', () => {
          item.object.data = { 'second-task': { foo: 'bar' } }

          expect(getCompleteSectionCount(sections, item.object)).toEqual(0)
        })

        it('returns 1 when a section is complete', () => {
          item.object.data = { 'second-task': { foo: 'bar' }, 'first-task': { foo: 'baz' } }
          expect(getCompleteSectionCount(sections, item.object)).toEqual(1)
        })

        it('returns 2 when a both sections are complete', () => {
          item.object.data = {
            'second-task': { foo: 'bar' },
            'first-task': { foo: 'baz' },
            'something-else': { foo: 'baz' },
          }

          expect(getCompleteSectionCount(sections, item.object)).toEqual(2)
        })
      })
    })
  })
})
