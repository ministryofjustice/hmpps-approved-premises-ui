import type { Task } from '@approved-premises/ui'

import applicationFactory from '../testutils/factories/application'
import { tierEnvelopeFactory } from '../testutils/factories/risks'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { DateFormats } from './dateUtils'
import { tierBadge } from './personUtils'

import {
  getTaskStatus,
  getCompleteSectionCount,
  getResponses,
  getPage,
  getArrivalDate,
  dashboardTableRows,
} from './applicationUtils'
import { SessionDataError, UnknownPageError } from './errors'

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

  describe('getArrivalDate', () => {
    it('returns the arrival date when the release date is known and is the same as the start date', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
            'placement-date': { startDateSameAsReleaseDate: 'yes' },
          },
        },
      })
      expect(getArrivalDate(application)).toEqual('2022-11-14')
    })

    it('returns the arrival date when the release date is known but there is a different start date', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
            'placement-date': { startDateSameAsReleaseDate: 'no', startDate: '2023-10-13' },
          },
        },
      })

      expect(getArrivalDate(application)).toEqual('2023-10-13')
    })

    it('throws an error or returns null when the release date is not known', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'no' },
          },
        },
      })

      expect(() => getArrivalDate(application)).toThrow(new SessionDataError('No known release date'))
      expect(getArrivalDate(application, false)).toEqual(null)
    })
  })

  describe('dashboardTableRows', () => {
    it('returns an array of applications as table rows', async () => {
      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const applicationA = applicationFactory.build({
        person: { name: 'A' },
        data: {},
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'A' },
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>${applicationA.person.name}</a>`,
          },
          {
            text: applicationA.person.crn,
          },
          {
            html: tierBadge('A1'),
          },
          {
            text: 'N/A',
          },
          {
            text: 'N/A',
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })}>${applicationB.person.name}</a>`,
          },
          {
            text: applicationB.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            text: DateFormats.isoDateToUIDate(applicationB.submittedAt, { format: 'short' }),
          },
        ],
      ])
    })
  })
})
