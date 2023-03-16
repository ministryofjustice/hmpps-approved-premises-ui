import applicationFactory from '../../testutils/factories/application'
import { tierEnvelopeFactory } from '../../testutils/factories/risks'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import { DateFormats } from '../dateUtils'
import { isApplicableTier, tierBadge } from '../personUtils'

import {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  getApplicationType,
  getPage,
  getResponses,
  getStatus,
  isUnapplicable,
} from './utils'
import { UnknownPageError } from '../errors'

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: { 'reasons-for-placement': {} },
  }
})

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
  }
})

jest.mock('../personUtils')

Apply.pages['basic-information'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

Assess.pages['assess-page'] = {
  first: AssessPage,
}

describe('utils', () => {
  describe('getResponses', () => {
    it('returns the responses from all answered questions', () => {
      FirstApplyPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondApplyPage.mockReturnValue({
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
    it('should return a page from Apply if it exists', () => {
      expect(getPage('basic-information', 'first')).toEqual(FirstApplyPage)
      expect(getPage('basic-information', 'second')).toEqual(SecondApplyPage)
    })

    it('should return a page from assess if passed the option', () => {
      expect(getPage('assess-page', 'first', true)).toEqual(AssessPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('basic-information', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('getResponseForPage', () => {
    it('returns the response for a given page', () => {
      FirstApplyPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondApplyPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' } }

      expect(getResponses(application)).toEqual({ 'basic-information': [{ foo: 'bar' }, { bar: 'foo' }] })
    })
  })

  describe('dashboardTableRows', () => {
    it('returns an array of applications as table rows', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
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

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>${applicationA.person.name}</a>`,
          },
          {
            text: applicationA.person.crn,
          },
          {
            html: 'TIER_BADGE',
          },
          {
            text: 'N/A',
          },
          {
            html: getStatus(applicationB),
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
            html: getStatus(applicationB),
          },
        ],
      ])
    })
  })

  describe('dashboardTableRows when tier is undefined', () => {
    it('returns a blank tier badge', async () => {
      ;(tierBadge as jest.Mock).mockClear()
      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const application = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'My Name' },
        risks: { tier: undefined },
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })}>My Name</a>`,
          },
          {
            text: application.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(application),
          },
        ],
      ])
    })
  })

  describe('dashboardTableRows when risks is undefined', () => {
    it('returns a blank tier badge', async () => {
      ;(tierBadge as jest.Mock).mockClear()
      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const application = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'My Name' },
        risks: undefined,
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })}>My Name</a>`,
          },
          {
            text: application.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(application),
          },
        ],
      ])
    })
  })

  describe('getStatus', () => {
    it('returns the correct tag for each status', () => {
      const inProgressApplication = applicationFactory.build({ status: 'inProgress' })
      const submittedApplication = applicationFactory.build({ status: 'submitted' })
      const informationRequestedApplication = applicationFactory.build({ status: 'requestedFurtherInformation' })

      expect(getStatus(inProgressApplication)).toEqual('<strong class="govuk-tag govuk-tag--blue">In Progress</strong>')
      expect(getStatus(submittedApplication)).toEqual('<strong class="govuk-tag">Submitted</strong>')
      expect(getStatus(informationRequestedApplication)).toEqual(
        '<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>',
      )
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page for an applicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
      )
    })

    it('returns the is exceptional case page for an unapplicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(false)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('returns the is exceptional case page for an application for a person without a tier', () => {
      const application = applicationFactory.build()
      application.risks = undefined

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })
  })

  describe('isUnapplicable', () => {
    const application = applicationFactory.build()

    it('should return true if the applicant has answered no to the isExceptionalCase question', () => {
      application.data = {
        'basic-information': {
          'is-exceptional-case': {
            isExceptionalCase: 'no',
          },
        },
      }

      expect(isUnapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question', () => {
      application.data = {
        'basic-information': {
          'is-exceptional-case': {
            isExceptionalCase: 'yes',
          },
        },
      }

      expect(isUnapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      expect(isUnapplicable(application)).toEqual(false)
    })
  })

  describe('getApplicationType', () => {
    it('returns standard when the application is not PIPE', () => {
      const application = applicationFactory.build({
        isPipeApplication: false,
      })

      expect(getApplicationType(application)).toEqual('Standard')
    })

    it('returns PIPE when the application is PIPE', () => {
      const application = applicationFactory.build({
        isPipeApplication: true,
      })

      expect(getApplicationType(application)).toEqual('PIPE')
    })
  })
})
