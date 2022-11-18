import type { Task } from '@approved-premises/ui'

import applicationFactory from '../testutils/factories/application'
import paths from '../paths/apply'
import { pages } from '../form-pages/apply'

import { taskLink, getTaskStatus, getCompleteSectionCount, getResponses, getPage } from './applicationUtils'
import { UnknownPageError } from './errors'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('applicationUtils', () => {
  const task = {
    id: 'type-of-ap',
    title: 'Type of Approved Premises required',
    pages: { foo: 'bar', bar: 'baz' },
  } as Task

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
  })

  describe('taskLink', () => {
    it('should return a link to a task when the previous task is complete', () => {
      const application = applicationFactory.build({ id: 'some-uuid', data: { 'basic-information': { foo: 'bar' } } })

      expect(taskLink(task, application)).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'foo',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })

    it('should return the task name when the previous task is incomplete', () => {
      const application = applicationFactory.build({ id: 'some-uuid' })

      expect(taskLink(task, application)).toEqual(`Type of Approved Premises required`)
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

  describe('getResponses', () => {
    it('returns the responses from all answered questions', () => {
      FirstPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' } }

      expect(getResponses(application)).toEqual({ 'basic-information': [{ foo: 'bar' }, { bar: 'foo' }] })
    })
  })

  describe('getPage', () => {
    it('should return a page if it exists', () => {
      expect(getPage('basic-information', 'first')).toEqual(FirstPage)
      expect(getPage('basic-information', 'second')).toEqual(SecondPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('basic-information', 'bar')
      }).toThrow(UnknownPageError)
    })
  })
})
