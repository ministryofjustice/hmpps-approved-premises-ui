import { ApplicationSortField, ApplicationStatus } from '@approved-premises/api'
import { isAfter } from 'date-fns'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import {
  applicationFactory,
  applicationSummaryFactory,
  assessmentFactory,
  personFactory,
  placementApplicationFactory,
  restrictedPersonFactory,
  tierEnvelopeFactory,
  timelineEventFactory,
  userFactory,
} from '../../testutils/factories'
import paths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { DateFormats } from '../dateUtils'
import { isApplicableTier, isFullPerson, tierBadge } from '../personUtils'

import {
  applicationTableRows,
  createWithdrawElement,
  dashboardTableHeader,
  dashboardTableRows,
  eventTypeTranslations,
  firstPageOfApplicationJourney,
  getApplicationType,
  getSections,
  getStatus,
  isInapplicable,
  lengthOfStayForUI,
  mapPlacementApplicationToSummaryCards,
  mapTimelineEventsForUi,
  statusTags,
  unwithdrawableApplicationStatuses,
} from './utils'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { RestrictedPersonError } from '../errors'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromFormArtifact'
import { durationAndArrivalDateFromPlacementApplication } from '../placementRequests/placementApplicationSubmissionData'
import { sortHeader } from '../sortHeader'

jest.mock('../placementRequests/placementApplicationSubmissionData')
jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../journeyTypeFromArtifact')
const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()
const PlacementRequestPage = jest.fn()

jest.mock('../../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

jest.mock('../../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
  }
})

jest.mock('../personUtils')

const applySection1Task1 = {
  id: 'first-apply-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2 = {
  id: 'first-apply-section-task-2',
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1',
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2',
  title: 'Second Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection1 = {
  name: 'first-apply-section',
  title: 'First Apply section',
  tasks: [applySection1Task1, applySection1Task2],
}

const applySection2 = {
  name: 'second-apply-section',
  title: 'Second Apply section',
  tasks: [applySection2Task1, applySection2Task2],
}

Apply.sections = [applySection1, applySection2]

Apply.pages['first-apply-section-task-1'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

const assessSection1Task1 = {
  id: 'first-assess-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2',
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1',
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2',
  title: 'Second Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection1 = {
  name: 'first-assess-section',
  title: 'First Assess section',
  tasks: [assessSection1Task1, assessSection1Task2],
}

const assessSection2 = {
  name: 'second-assess-section',
  title: 'Second Assess section',
  tasks: [assessSection2Task1, assessSection2Task2],
}

Assess.sections = [assessSection1, assessSection2]

Assess.pages['assess-page'] = {
  first: AssessPage,
}

PlacementRequest.pages['placement-request-page'] = {
  first: PlacementRequestPage,
}

describe('utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('applicationTableRows', () => {
    const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
    const person = personFactory.build({ name: 'My name' })

    it('returns an array of applications as table rows', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const applicationA = applicationSummaryFactory.build({
        arrivalDate: undefined,
        person,
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = applicationTableRows([applicationA, applicationB])

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })} data-cy-id="${applicationA.id}">${
              person.name
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
            html: getStatus(applicationA),
          },
          createWithdrawElement(applicationA.id, applicationA),
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })} data-cy-id="${applicationB.id}">${
              person.name
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
          createWithdrawElement(applicationB.id, applicationB),
        ],
      ])
    })

    describe('when tier is undefined', () => {
      it('returns a blank tier badge', async () => {
        ;(tierBadge as jest.Mock).mockClear()
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: { tier: undefined },
          status: 'inProgress',
        })

        const result = applicationTableRows([application])

        expect(tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })

    describe('when risks is undefined', () => {
      it('returns a blank tier badge', async () => {
        ;(tierBadge as jest.Mock).mockClear()
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: undefined,
        })

        const result = applicationTableRows([application])

        expect(tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })
  })

  describe('dashboardTableHeader', () => {
    const sortBy = 'createdAt'
    const sortDirection = 'asc'
    const hrefPrefix = 'http://example.com'

    it('returns header values', () => {
      expect(dashboardTableHeader(sortBy, sortDirection, hrefPrefix)).toEqual([
        {
          text: 'Name',
        },
        {
          text: 'CRN',
        },
        sortHeader<ApplicationSortField>('Tier', 'tier', sortBy, sortDirection, hrefPrefix),
        sortHeader<ApplicationSortField>('Arrival Date', 'arrivalDate', sortBy, sortDirection, hrefPrefix),
        sortHeader<ApplicationSortField>('Date of application', 'createdAt', sortBy, sortDirection, hrefPrefix),
        {
          text: 'Status',
        },
      ])
    })
  })

  describe('dashboardTableRows', () => {
    const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
    const person = personFactory.build({ name: 'A' })

    it('returns an array of applications as table rows', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const applicationA = applicationSummaryFactory.build({
        arrivalDate: undefined,
        person,
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })} data-cy-id="${applicationA.id}">${
              person.name
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
            text: DateFormats.isoDateToUIDate(applicationA.createdAt, { format: 'short' }),
          },
          {
            html: getStatus(applicationA),
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })} data-cy-id="${applicationB.id}">${
              person.name
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
            text: DateFormats.isoDateToUIDate(applicationB.createdAt, { format: 'short' }),
          },
          {
            html: getStatus(applicationB),
          },
        ],
      ])
    })

    describe('when tier is undefined', () => {
      it('returns a blank tier badge', async () => {
        ;(tierBadge as jest.Mock).mockClear()
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: { tier: undefined },
          status: 'inProgress',
        })

        const result = dashboardTableRows([application])

        expect(tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })

    describe('when risks is undefined', () => {
      it('returns a blank tier badge', async () => {
        ;(tierBadge as jest.Mock).mockClear()
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: undefined,
        })

        const result = dashboardTableRows([application])

        expect(tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
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

  describe('getSections', () => {
    it('returns Apply sections when given an application', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('applications')

      const application = applicationFactory.build()
      const sections = getSections(application)

      expect(sections).toEqual(Apply.sections.slice(0, -1))
    })

    it('returns Assess sections when given an assessment', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue('assessments')

      const assessment = assessmentFactory.build()
      const sections = getSections(assessment)

      expect(sections).toEqual(Assess.sections)
    })

    it('returns PlacementApplication sections when given a placement application', () => {
      ;(journeyTypeFromArtifact as jest.MockedFunction<typeof journeyTypeFromArtifact>).mockReturnValue(
        'placement-applications',
      )

      const placementApplication = placementApplicationFactory.build()

      const sections = getSections(placementApplication)

      expect(sections).toEqual(PlacementRequest.sections)
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page for an applicable application', () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.withFullPerson().build()
      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'confirm-your-details' }),
      )
    })

    it('returns the is exceptional case page for an unapplicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(false)
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const application = applicationFactory.withFullPerson().build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('returns the "is exceptional case" page for an application for a person without a tier', () => {
      const application = applicationFactory.withFullPerson().build()
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      application.risks = undefined

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('throws an error if the person is not a Full Person', () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(false)

      const restrictedPerson = restrictedPersonFactory.build()
      const application = applicationFactory.build({ person: restrictedPerson })

      expect(() => firstPageOfApplicationJourney(application)).toThrowError(
        `CRN: ${restrictedPerson.crn} is restricted`,
      )
      expect(() => firstPageOfApplicationJourney(application)).toThrowError(RestrictedPersonError)
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

  describe('createWithdrawElement', () => {
    const withdrawalableApplicationStatues: Array<ApplicationStatus> = [
      'awaitingPlacement',
      'inProgress',
      'pending',
      'requestedFurtherInformation',
      'submitted',
    ]

    it.each(withdrawalableApplicationStatues)(
      'returns a link to withdraw the application if the application status is %s',
      status => {
        const applicationSummary = applicationSummaryFactory.build({ status })
        expect(createWithdrawElement('id', applicationSummary)).toEqual({
          html: '<a href="/applications/id/withdrawals/new">Withdraw</a>',
        })
      },
    )

    it.each(unwithdrawableApplicationStatuses)('returns an empty string if the application status is %s', status => {
      const applicationSummary = applicationSummaryFactory.build({ status })

      expect(createWithdrawElement('id', applicationSummary)).toEqual({
        text: '',
      })
    })
  })

  describe('mapTimelineEventsForUi', () => {
    it('maps the events into the format required by the MoJ UI Timeline component', () => {
      const timelineEvents = timelineEventFactory.buildList(1)
      expect(mapTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: timelineEvents[0].content,
        },
      ])
    })

    it('sorts the events in ascending order', () => {
      const timelineEvents = timelineEventFactory.buildList(3)

      const actual = mapTimelineEventsForUi(timelineEvents)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[0].datetime.timestamp),
          DateFormats.isoToDateObj(actual[1].datetime.timestamp),
        ),
      ).toEqual(true)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[0].datetime.timestamp),
          DateFormats.isoToDateObj(actual[2].datetime.timestamp),
        ),
      ).toEqual(true)

      expect(
        isAfter(
          DateFormats.isoToDateObj(actual[1].datetime.timestamp),
          DateFormats.isoToDateObj(actual[2].datetime.timestamp),
        ),
      ).toEqual(true)
    })
  })

  describe('mapPlacementApplicationToSummaryCards', () => {
    const application = applicationFactory.build()
    const user = userFactory.build()
    const placementApplications = placementApplicationFactory.buildList(1, { createdByUserId: user.id })
    const arrivalDate = '2023-01-01'
    const duration = '20'

    it('returns a placement application mapped to SummaryCard including an action when the placement application can be withdrawn', () => {
      ;(
        retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromApplicationOrAssessment
        >
      ).mockReturnValue('rotl')
      ;(
        durationAndArrivalDateFromPlacementApplication as jest.MockedFunction<
          typeof durationAndArrivalDateFromPlacementApplication
        >
      ).mockReturnValue({ expectedArrival: arrivalDate, duration })

      expect(mapPlacementApplicationToSummaryCards(placementApplications, application, user)).toEqual([
        {
          card: {
            title: { headingLevel: '3', text: DateFormats.isoDateToUIDate(placementApplications[0].createdAt) },
            attributes: { 'data-cy-placement-application-id': placementApplications[0].id },
            actions: {
              items: [
                {
                  href: placementApplicationPaths.placementApplications.withdraw.new({
                    id: placementApplications[0].id,
                  }),
                  text: 'Withdraw',
                },
              ],
            },
          },
          rows: [
            {
              key: {
                text: 'Reason for placement request',
              },
              value: {
                text: 'Release on Temporary Licence (ROTL)',
              },
            },
            {
              key: {
                text: 'Arrival date',
              },
              value: {
                text: DateFormats.isoDateToUIDate(arrivalDate),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(duration) },
            },
          ],
        },
      ])
    })

    it('doesnt include an action when the placement application doesnt have the the canBeWithdrawn boolean', () => {
      ;(
        retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromApplicationOrAssessment
        >
      ).mockReturnValue('rotl')
      ;(
        durationAndArrivalDateFromPlacementApplication as jest.MockedFunction<
          typeof durationAndArrivalDateFromPlacementApplication
        >
      ).mockReturnValue({ expectedArrival: arrivalDate, duration })
      placementApplications[0].canBeWithdrawn = undefined

      expect(mapPlacementApplicationToSummaryCards(placementApplications, application, user)).toEqual([
        {
          card: {
            title: { headingLevel: '3', text: DateFormats.isoDateToUIDate(placementApplications[0].createdAt) },
            attributes: { 'data-cy-placement-application-id': placementApplications[0].id },
            actions: {
              items: [],
            },
          },
          rows: [
            {
              key: {
                text: 'Reason for placement request',
              },
              value: {
                text: 'Release on Temporary Licence (ROTL)',
              },
            },
            {
              key: {
                text: 'Arrival date',
              },
              value: {
                text: DateFormats.isoDateToUIDate(arrivalDate),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(duration) },
            },
          ],
        },
      ])
    })

    it('doesnt include an action when the placement application isnt created by the acting user', () => {
      ;(
        retrieveOptionalQuestionResponseFromApplicationOrAssessment as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromApplicationOrAssessment
        >
      ).mockReturnValue('rotl')
      ;(
        durationAndArrivalDateFromPlacementApplication as jest.MockedFunction<
          typeof durationAndArrivalDateFromPlacementApplication
        >
      ).mockReturnValue({ expectedArrival: arrivalDate, duration })
      placementApplications[0].canBeWithdrawn = true
      placementApplications[0].createdByUserId = 'another-user-id'

      expect(mapPlacementApplicationToSummaryCards(placementApplications, application, user)).toEqual([
        {
          card: {
            title: { headingLevel: '3', text: DateFormats.isoDateToUIDate(placementApplications[0].createdAt) },
            attributes: { 'data-cy-placement-application-id': placementApplications[0].id },
            actions: {
              items: [],
            },
          },
          rows: [
            {
              key: {
                text: 'Reason for placement request',
              },
              value: {
                text: 'Release on Temporary Licence (ROTL)',
              },
            },
            {
              key: {
                text: 'Arrival date',
              },
              value: {
                text: DateFormats.isoDateToUIDate(arrivalDate),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(duration) },
            },
          ],
        },
      ])
    })
  })

  describe('lengthOfStayForUI', () => {
    it('returns 0 days if the length of stay is "0"', () => {
      expect(lengthOfStayForUI('0')).toEqual('0 days')
    })

    it('returns 1 day if the length of stay is "1"', () => {
      expect(lengthOfStayForUI('1')).toEqual('1 day')
    })

    it('returns 2 days if the length of stay is "2"', () => {
      expect(lengthOfStayForUI('2')).toEqual('2 days')
    })

    it('returns "None supplied if the length of stay is an empty string', () => {
      expect(lengthOfStayForUI('')).toEqual('None supplied')
    })
  })
})
