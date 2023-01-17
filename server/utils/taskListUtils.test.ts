import { Task } from '../@types/ui'
import paths from '../paths/apply'
import applicationFactory from '../testutils/factories/application'
import { getTaskStatus, getCompleteSectionCount, taskLink } from './taskListUtils'
import Apply from '../form-pages/apply'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

Apply.pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('taskListUtils', () => {
  const task = {
    id: 'type-of-ap',
    title: 'Type of Approved Premises required',
    pages: { foo: 'bar', bar: 'baz' },
  } as Task

  describe('taskLink', () => {
    it('should return a link to a task when the previous task is complete', () => {
      const application = applicationFactory.build({ id: 'some-uuid', data: { 'basic-information': { foo: 'bar' } } })

      expect(taskLink(task, application, 'applications')).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'foo',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })

    it('should return the task name when the previous task is incomplete', () => {
      const application = applicationFactory.build({ id: 'some-uuid' })

      expect(taskLink(task, application, 'applications')).toEqual(`Type of Approved Premises required`)
    })

    it('should return the task name when the application has no data', () => {
      const application = applicationFactory.build({ id: 'some-uuid', data: null })

      expect(taskLink(task, application, 'applications')).toEqual(`Type of Approved Premises required`)
    })
  })

  describe('getTaskStatus', () => {
    it('returns a cannot start tag when the task is incomplete and the previous task is also complete', () => {
      const application = applicationFactory.build()
      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="type-of-ap-status">Cannot start yet</strong>',
      )
    })

    it('returns a not started tag when the task is incomplete and the previous task is complete', () => {
      const application = applicationFactory.build({ data: { 'basic-information': { foo: 'bar' } } })
      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="type-of-ap-status">Not started</strong>',
      )
    })

    it('returns a completed tag when the task is complete', () => {
      const application = applicationFactory.build({
        data: { 'basic-information': { foo: 'bar' }, 'type-of-ap': { foo: 'bar' } },
      })

      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag app-task-list__tag" id="type-of-ap-status">Completed</strong>',
      )
    })

    it('works when the application has no data', () => {
      const application = applicationFactory.build({ data: null })
      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="type-of-ap-status">Cannot start yet</strong>',
      )
    })
  })

  describe('getCompleteSectionCount', () => {
    const sections = [
      {
        title: 'Section 1',
        tasks: [
          {
            id: 'basic-information',
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
      const application = applicationFactory.build()

      expect(getCompleteSectionCount(sections, application)).toEqual(0)
    })

    it('returns zero when a section is part completed', () => {
      const application = applicationFactory.build({ data: { 'type-of-ap': { foo: 'bar' } } })

      expect(getCompleteSectionCount(sections, application)).toEqual(0)
    })

    it('returns 1 when a section is complete', () => {
      const application = applicationFactory.build({
        data: { 'type-of-ap': { foo: 'bar' }, 'basic-information': { foo: 'baz' } },
      })

      expect(getCompleteSectionCount(sections, application)).toEqual(1)
    })

    it('returns 2 when a both sections are complete', () => {
      const application = applicationFactory.build({
        data: {
          'type-of-ap': { foo: 'bar' },
          'basic-information': { foo: 'baz' },
          'something-else': { foo: 'baz' },
        },
      })

      expect(getCompleteSectionCount(sections, application)).toEqual(2)
    })
  })
})
