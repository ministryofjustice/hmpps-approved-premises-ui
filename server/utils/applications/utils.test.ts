import { ApplicationStatus } from '@approved-premises/api'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import { applicationFactory, applicationSummaryFactory, tierEnvelopeFactory } from '../../testutils/factories'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { DateFormats } from '../dateUtils'
import { isApplicableTier, tierBadge } from '../personUtils'

import {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  getApplicationType,
  getPage,
  getResponses,
  getStatus,
  isInapplicable,
  statusTags,
} from './utils'
import { UnknownPageError } from '../errors'

jest.mock('../personUtils')
jest.mock('../retrieveQuestionResponseFromFormArtifact')

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

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

jest.mock('../../form-pages/placement-application', () => {
  return {
    pages: { 'placement-request-page': {} },
  }
})

Apply.pages['basic-information'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

Assess.pages['assess-page'] = {
  first: AssessPage,
}

PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
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
      expect(getPage('basic-information', 'first', 'applications')).toEqual(FirstApplyPage)
      expect(getPage('basic-information', 'second', 'applications')).toEqual(SecondApplyPage)
    })

    it('should return a page from assess if passed the an assessment', () => {
      expect(getPage('assess-page', 'first', 'assessments')).toEqual(AssessPage)
    })

    it('should return a page from the placement request journey if passed the placement requests', () => {
      expect(getPage('placement-request-page', 'first', 'placement-applications')).toEqual(PlacementRequestPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('basic-information', 'bar', 'applications')
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

      const applicationA = applicationSummaryFactory.build({
        arrivalDate: undefined,
        person: { name: 'A' },
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person: { name: 'A' },
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })} data-cy-id="${applicationA.id}">${
              applicationA.person.name
            }</a>`,
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
            html: `<a href=${paths.applications.show({ id: applicationB.id })} data-cy-id="${applicationB.id}">${
              applicationB.person.name
            }</a>`,
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

      const application = applicationSummaryFactory.build({
        arrivalDate,
        person: { name: 'My Name' },
        risks: { tier: undefined },
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })} data-cy-id="${
              application.id
            }">My Name</a>`,
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

      const application = applicationSummaryFactory.build({
        arrivalDate,
        person: { name: 'My Name' },
        risks: undefined,
      })

      const result = dashboardTableRows([application])

      expect(tierBadge).not.toHaveBeenCalled()

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: application.id })} data-cy-id="${
              application.id
            }">My Name</a>`,
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
    const statuses = Object.keys(statusTags) as Array<ApplicationStatus>

    statuses.forEach(status => {
      it(`returns the correct tag for each an application with a status of ${status}`, () => {
        const application = applicationFactory.build({ status })
        expect(getStatus(application)).toEqual(statusTags[status])
      })
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page for an applicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'transgender' }),
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

  describe('isInapplicable', () => {
    const application = applicationFactory.build()

    it('should return true if the applicant has answered no to the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return true if the applicant has answered yes to the isExceptionalCase question and no to the agreedCaseWithManager question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes', agreedCaseWithManager: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question and yes to the agreedCaseWithManager question', () => {
      mockOptionalQuestionResponse({ isExceptionalCase: 'yes', agreedCaseWithManager: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({})

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return true if the applicant has answered no to the shouldPersonBePlacedInMaleAp question', () => {
      mockOptionalQuestionResponse({ shouldPersonBePlacedInMaleAp: 'no' })

      expect(isInapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the shouldPersonBePlacedInMaleAp question', () => {
      mockOptionalQuestionResponse({ shouldPersonBePlacedInMaleAp: 'yes' })

      expect(isInapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({})

      expect(isInapplicable(application)).toEqual(false)
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
