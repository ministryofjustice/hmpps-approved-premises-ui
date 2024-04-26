import {
  ApType,
  ApplicationSortField,
  ApprovedPremisesApplicationStatus as ApplicationStatus,
  ApprovedPremisesApplicationStatus,
  TimelineEventUrlType,
} from '@approved-premises/api'
import { isAfter } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ApplicationType } from '@approved-premises/ui'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import {
  applicationFactory,
  applicationSummaryFactory,
  applicationTimelineFactory,
  assessmentFactory,
  personFactory,
  personalTimelineFactory,
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
import { isApplicableTier, isFullPerson, nameOrPlaceholderCopy, tierBadge } from '../personUtils'

import {
  actionsCell,
  appealDecisionRadioItems,
  applicationStatusSelectOptions,
  applicationTableRows,
  dashboardTableHeader,
  dashboardTableRows,
  eventTypeTranslations,
  firstPageOfApplicationJourney,
  getAction,
  getApplicationType,
  getSections,
  isInapplicable,
  lengthOfStayForUI,
  mapApplicationTimelineEventsForUi,
  mapPersonalTimelineForUi,
  mapPlacementApplicationToSummaryCards,
  mapTimelineUrlsForUi,
  withdrawnStatusTag,
} from './utils'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { RestrictedPersonError } from '../errors'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import { durationAndArrivalDateFromPlacementApplication } from '../placementRequests/placementApplicationSubmissionData'
import { sortHeader } from '../sortHeader'
import { escape } from '../formUtils'
import { APPLICATION_SUITABLE, ApplicationStatusTag } from './statusTag'

jest.mock('../placementRequests/placementApplicationSubmissionData')
jest.mock('../retrieveQuestionResponseFromFormArtifact')
jest.mock('../applications/applicantAndCaseManagerDetails')
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
            text: DateFormats.isoDateToUIDate(applicationA.createdAt, { format: 'short' }),
          },
          {
            html: new ApplicationStatusTag(applicationA.status).html(),
          },
          actionsCell(applicationA),
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
            html: new ApplicationStatusTag(applicationB.status).html(),
          },
          actionsCell(applicationB),
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
          status: 'started',
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

    describe('withdrawal action link should be shown when application status is requestedFurtherInformation, started', () => {
      it.each(['requestedFurtherInformation', 'started'])(
        'should show withdrawal action link with %s statuses',
        async status => {
          ;(tierBadge as jest.Mock).mockClear()
          ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

          const application = applicationSummaryFactory.build({
            arrivalDate,
            person,
            status: status as ApprovedPremisesApplicationStatus,
          })

          const result = applicationTableRows([application])

          expect(result[0][6]).toEqual({
            html: `<ul class="govuk-list"><li><a href="/applications/${application.id}/withdrawals/new"  >Withdraw</a></li></ul>`,
          })
        },
      )

      it('should not show withdrawal action link with submitted status', async () => {
        ;(tierBadge as jest.Mock).mockClear()
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          status: 'submitted',
        })

        const result = applicationTableRows([application])

        expect(result[0][6]).toEqual({
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
        {
          text: 'Actions',
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
        hasRequestsForPlacement: false,
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
        hasRequestsForPlacement: false,
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
            html: new ApplicationStatusTag(applicationA.status).html(),
          },
          {
            html: '',
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
            html: new ApplicationStatusTag(applicationB.status).html(),
          },
          {
            html: '',
          },
        ],
      ])
    })

    it('returns an array of applications as table rows with actions', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const applicationA = applicationSummaryFactory.build({
        arrivalDate: undefined,
        person,
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
        status: 'submitted',
      })
      const applicationB = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
        status: 'awaitingPlacement',
      })
      const applicationC = applicationSummaryFactory.build({
        arrivalDate,
        person,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
        hasRequestsForPlacement: true,
      })

      const result = dashboardTableRows([applicationA, applicationB, applicationC])

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
            html: new ApplicationStatusTag(applicationA.status).html(),
          },
          {
            html: getAction(applicationA),
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
            html: new ApplicationStatusTag(applicationB.status).html(),
          },
          {
            html: getAction(applicationB),
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationC.id })} data-cy-id="${applicationC.id}">${
              person.name
            }</a>`,
          },
          {
            text: applicationC.person.crn,
          },
          {
            html: '',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            text: DateFormats.isoDateToUIDate(applicationC.createdAt, { format: 'short' }),
          },
          {
            html: new ApplicationStatusTag(applicationC.status).html(),
          },
          {
            html: getAction(applicationC),
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
          status: 'started',
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

    describe('when linkInProgressApplications is false', () => {
      it('returns the rows with the name cell without linking to the application', () => {
        ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        ;(nameOrPlaceholderCopy as jest.MockedFunction<typeof nameOrPlaceholderCopy>).mockReturnValue(person.name)

        const application = applicationSummaryFactory.build()

        const result = dashboardTableRows([application], { linkInProgressApplications: false })

        expect(result).toEqual([
          [
            {
              text: person.name,
            },
            {
              text: application.person.crn,
            },
            {
              html: 'TIER_BADGE',
            },
            {
              text: DateFormats.isoDateToUIDate(application.arrivalDate, { format: 'short' }),
            },
            {
              text: DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' }),
            },
            {
              html: new ApplicationStatusTag(application.status).html(),
            },
            {
              html: getAction(application),
            },
          ],
        ])
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

    it('returns the "enter risk level" page for an application for a person without a tier', () => {
      const application = applicationFactory.withFullPerson().build()
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      application.risks = undefined

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'enter-risk-level' }),
      )
    })

    it('returns the is exceptional case page for an application with an unsuitable tier', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(false)
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const application = applicationFactory.withFullPerson().build()

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
    describe('when `isEsapApplication` is `true`', () => {
      it('returns "ESAP"', () => {
        const application = applicationFactory.build({
          isEsapApplication: true,
        })
        expect(getApplicationType(application)).toEqual('ESAP')
      })
    })

    describe('when `isEsapApplication` is undefined` and `isPipeApplication` is `true`', () => {
      it('returns "PIPE"', () => {
        const application = applicationFactory.build({
          isEsapApplication: undefined,
          isPipeApplication: true,
        })
        expect(getApplicationType(application)).toEqual('PIPE')
      })
    })

    describe('when `isEsapApplication` and `isPipeApplication` are undefined', () => {
      it.each<[ApplicationType, ApType]>([
        ['Standard', 'normal'],
        ['ESAP', 'esap'],
        ['MHAP (Elliott House)', 'mhapElliottHouse'],
        ['MHAP (St Josephs)', 'mhapStJosephs'],
        ['PIPE', 'pipe'],
        ['RFAP', 'rfap'],
      ])('returns "%s" when the `apType` is "%s"', (expectedOutput, applicationApType) => {
        const application = applicationFactory.build({
          apType: applicationApType,
          isEsapApplication: undefined,
          isPipeApplication: undefined,
        })
        expect(getApplicationType(application)).toEqual(expectedOutput)
      })
    })
  })

  describe('actionsCell', () => {
    it('returns a link to withdraw the application', () => {
      const application = applicationFactory.build({ id: 'an-application-id' })

      expect(actionsCell(application)).toEqual({
        html: '<ul class="govuk-list"><li><a href="/applications/an-application-id/withdrawals/new"  >Withdraw</a></li></ul>',
      })
    })

    it('returns a link to withdraw and request for placement of the application', () => {
      const application = applicationFactory.build({ id: 'an-application-id', status: 'awaitingPlacement' })

      expect(actionsCell(application)).toEqual({
        html: '<ul class="govuk-list"><li><a href="/placement-applications?id=an-application-id"  >Request for placement</a></li></ul>',
      })
    })

    it.each(['rejected', 'withdrawn'])(
      'does not return a link to withdraw the application if the status is %s',
      (status: ApplicationStatus) => {
        const application = applicationFactory.build({ id: 'an-application-id', status })

        expect(actionsCell(application)).toEqual({
          html: '',
        })
      },
    )
  })

  describe('mapApplicationTimelineEventsForUi', () => {
    it('maps the events into the format required by the MoJ UI Timeline component', () => {
      const timelineEvents = timelineEventFactory.buildList(1)
      expect(mapApplicationTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: escape(timelineEvents[0].content),
          createdBy: timelineEvents[0].createdBy.name,
          associatedUrls: mapTimelineUrlsForUi([
            {
              type: timelineEvents[0].associatedUrls[0].type,
              url: timelineEvents[0].associatedUrls[0].url,
            },
          ]),
        },
      ])
    })

    it('maps the events into the format required by the MoJ UI Timeline component without associatedUrls', () => {
      const timelineEvents = timelineEventFactory.buildList(1, { associatedUrls: undefined })

      expect(mapApplicationTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: escape(timelineEvents[0].content),
          createdBy: timelineEvents[0].createdBy.name,
          associatedUrls: [],
        },
      ])
    })

    it('sorts the events in ascending order', () => {
      const timelineEvents = timelineEventFactory.buildList(3)

      const actual = mapApplicationTimelineEventsForUi(timelineEvents)

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

    it('doesnt error when there are events without "occuredAt" property', () => {
      const timelineEventWithoutOccurredAt = timelineEventFactory.build({ occurredAt: undefined })
      const pastTimelineEvent = timelineEventFactory.build({
        occurredAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
      })
      const futureTimelineEvent = timelineEventFactory.build({
        occurredAt: DateFormats.dateObjToIsoDateTime(faker.date.future()),
      })

      const actual = mapApplicationTimelineEventsForUi([
        timelineEventWithoutOccurredAt,
        pastTimelineEvent,
        futureTimelineEvent,
      ])

      expect(actual).toEqual([
        ...mapApplicationTimelineEventsForUi([timelineEventWithoutOccurredAt]),
        ...mapApplicationTimelineEventsForUi([futureTimelineEvent]),
        ...mapApplicationTimelineEventsForUi([pastTimelineEvent]),
      ])
    })

    it('escapes any rogue HTML', () => {
      const timelineEventWithRogueHTML = timelineEventFactory.build({ content: '<div>Hello!</div>' })

      const actual = mapApplicationTimelineEventsForUi([timelineEventWithRogueHTML])

      expect(actual[0].content).toEqual('&lt;div&gt;Hello!&lt;/div&gt;')
    })
  })

  describe('mapTimelineUrlsForUi', () => {
    it.each([
      ['application', 'application'],
      ['assessment', 'assessment'],
      ['booking', 'placement'],
      ['assessmentAppeal', 'appeal'],
    ])('Translates a "%s" url type to "%s"', (urlType: TimelineEventUrlType, translation: string) => {
      const timelineUrl = { type: urlType, url: faker.internet.url() }
      expect(mapTimelineUrlsForUi([timelineUrl])).toEqual([{ url: timelineUrl.url, type: translation }])
    })
  })

  describe('mapPersonTimelineForUi', () => {
    it('maps the application timelines events for the UI', () => {
      const applicationTimeline = applicationTimelineFactory.build()
      const personalTimeline = personalTimelineFactory.build({ applications: [applicationTimeline] })

      expect(mapPersonalTimelineForUi(personalTimeline)).toEqual([
        {
          ...applicationTimeline,
          timelineEvents: mapApplicationTimelineEventsForUi(applicationTimeline.timelineEvents),
        },
      ])
    })
  })

  describe('mapPlacementApplicationToSummaryCards', () => {
    const application = applicationFactory.build()
    const user = userFactory.build()
    const arrivalDate = '2023-01-01'
    const duration = 20

    const placementApplications = placementApplicationFactory.buildList(1, {
      createdByUserId: user.id,
      type: 'Additional',
      placementDates: [{ expectedArrival: arrivalDate, duration }],
    })

    const OLD_ENV = process.env

    beforeEach(() => {
      jest.resetModules()
      process.env = { ...OLD_ENV }
    })

    afterAll(() => {
      process.env = OLD_ENV
    })

    it('returns a summary card for an initial placement application', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = ''
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue(undefined)

      const initialPlacementApplication = placementApplicationFactory.build({
        type: 'Initial',
        isWithdrawn: false,
        createdByUserId: user.id,
        placementDates: [{ expectedArrival: arrivalDate, duration }],
      })

      expect(mapPlacementApplicationToSummaryCards([initialPlacementApplication], application, user)).toEqual([
        {
          card: {
            title: { headingLevel: '3', text: DateFormats.isoDateToUIDate(initialPlacementApplication.createdAt) },
            attributes: { 'data-cy-placement-application-id': initialPlacementApplication.id },
            actions: {
              items: [
                {
                  href: paths.applications.withdraw.new({
                    id: application.id,
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
                text: 'Initial request for placement',
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

    it('returns a placement application mapped to SummaryCard including an action when the placement application can be withdrawn', () => {
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

      expect(mapPlacementApplicationToSummaryCards(placementApplications, application, user)).toEqual([
        {
          card: {
            title: { headingLevel: '3', text: DateFormats.isoDateToUIDate(placementApplications[0].createdAt) },
            attributes: { 'data-cy-placement-application-id': placementApplications[0].id },
            actions: {
              items: [
                {
                  href: paths.applications.withdraw.new({
                    id: application.id,
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

    it('falls back to the dates from the application if there arent placementDates', () => {
      const arrivalDateFromData = '2023-02-01'
      const durationFromData = 19
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')
      ;(
        durationAndArrivalDateFromPlacementApplication as jest.MockedFunction<
          typeof durationAndArrivalDateFromPlacementApplication
        >
      ).mockReturnValue([{ expectedArrival: arrivalDateFromData, duration: durationFromData }])

      const placementApplicationsWithoutPlacementDates = placementApplicationFactory.buildList(1, {
        placementDates: undefined,
        type: 'Additional',
        createdByUserId: user.id,
      })

      expect(
        mapPlacementApplicationToSummaryCards(placementApplicationsWithoutPlacementDates, application, user),
      ).toEqual([
        {
          card: {
            title: {
              headingLevel: '3',
              text: DateFormats.isoDateToUIDate(placementApplicationsWithoutPlacementDates[0].createdAt),
            },
            attributes: { 'data-cy-placement-application-id': placementApplicationsWithoutPlacementDates[0].id },
            actions: {
              items: [
                {
                  href: paths.applications.withdraw.new({
                    id: application.id,
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
                text: DateFormats.isoDateToUIDate(arrivalDateFromData),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(durationFromData) },
            },
          ],
        },
      ])
    })

    it('links to the old withdrawal link when NEW_WITHDRAWALS_FLOW_DISABLED is set', () => {
      process.env.NEW_WITHDRAWALS_FLOW_DISABLED = '1'
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

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

    it('can display multiple placement dates', () => {
      const arrivalDate1 = arrivalDate
      const duration1 = duration
      const arrivalDate2 = '2023-02-01'
      const duration2 = 30

      const placementApplicationWithMultipleDates = placementApplicationFactory.buildList(1, {
        placementDates: [
          { expectedArrival: arrivalDate1, duration: duration1 },
          { expectedArrival: arrivalDate2, duration: duration2 },
        ],
        canBeWithdrawn: true,
        createdByUserId: user.id,
        type: 'Additional',
      })

      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

      expect(mapPlacementApplicationToSummaryCards(placementApplicationWithMultipleDates, application, user)).toEqual([
        {
          card: {
            title: {
              headingLevel: '3',
              text: DateFormats.isoDateToUIDate(placementApplicationWithMultipleDates[0].createdAt),
            },
            attributes: { 'data-cy-placement-application-id': placementApplicationWithMultipleDates[0].id },
            actions: {
              items: [
                {
                  href: paths.applications.withdraw.new({
                    id: application.id,
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
                text: DateFormats.isoDateToUIDate(arrivalDate1),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(duration1) },
            },
            {
              key: {
                text: 'Arrival date',
              },
              value: {
                text: DateFormats.isoDateToUIDate(arrivalDate2),
              },
            },
            {
              key: {
                text: 'Length of stay',
              },
              value: { text: lengthOfStayForUI(duration2) },
            },
          ],
        },
      ])
    })

    it('doesnt include an action when the placement application doesnt have the the canBeWithdrawn boolean', () => {
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

      const withdrawnPlacementApplications = placementApplicationFactory.buildList(1, {
        isWithdrawn: false,
        type: 'Additional',
        placementDates: [{ expectedArrival: arrivalDate, duration }],
      })

      expect(mapPlacementApplicationToSummaryCards(withdrawnPlacementApplications, application, user)).toEqual([
        {
          card: {
            title: {
              headingLevel: '3',
              text: DateFormats.isoDateToUIDate(withdrawnPlacementApplications[0].createdAt),
            },
            attributes: { 'data-cy-placement-application-id': withdrawnPlacementApplications[0].id },
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

    it('includes a withdrawn flag when the placement application is withdrawn', () => {
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

      const withdrawnPlacementApplications = placementApplicationFactory.buildList(1, {
        isWithdrawn: true,
        type: 'Additional',
        placementDates: [{ expectedArrival: arrivalDate, duration }],
      })

      expect(mapPlacementApplicationToSummaryCards(withdrawnPlacementApplications, application, user)).toEqual([
        {
          card: {
            title: {
              headingLevel: '3',
              text: DateFormats.isoDateToUIDate(withdrawnPlacementApplications[0].createdAt),
            },
            attributes: { 'data-cy-placement-application-id': withdrawnPlacementApplications[0].id },
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
            withdrawnStatusTag,
          ],
        },
      ])
    })

    it('doesnt include an action when the placement application isnt created by the acting user', () => {
      ;(
        retrieveOptionalQuestionResponseFromFormArtifact as jest.MockedFunction<
          typeof retrieveOptionalQuestionResponseFromFormArtifact
        >
      ).mockReturnValue('rotl')

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
      expect(lengthOfStayForUI(0)).toEqual('0 days')
    })

    it('returns 1 day if the length of stay is "1"', () => {
      expect(lengthOfStayForUI(1)).toEqual('1 day')
    })

    it('returns 2 days if the length of stay is "2"', () => {
      expect(lengthOfStayForUI(2)).toEqual('2 days')
    })

    it('returns "None supplied if the length of stay is null', () => {
      expect(lengthOfStayForUI(null)).toEqual('None supplied')
    })
  })

  describe('applicationStatusSelectOptions', () => {
    it('should return select options for tiers with the all tiers option selected by default', () => {
      expect(applicationStatusSelectOptions(null)).toEqual([
        { selected: true, text: 'All statuses', value: '' },
        { selected: false, text: 'Application started', value: 'started' },
        { selected: false, text: 'Application submitted', value: 'submitted' },
        { selected: false, text: 'Application rejected', value: 'rejected' },
        { selected: false, text: 'Awaiting assessment', value: 'awaitingAssesment' },
        { selected: false, text: 'Unallocated assessment', value: 'unallocatedAssesment' },
        { selected: false, text: 'Assessment in progress', value: 'assesmentInProgress' },
        { selected: false, text: APPLICATION_SUITABLE, value: 'awaitingPlacement' },
        { selected: false, text: APPLICATION_SUITABLE, value: 'placementAllocated' },
        { selected: false, text: 'Application inapplicable', value: 'inapplicable' },
        { selected: false, text: 'Application withdrawn', value: 'withdrawn' },
        { selected: false, text: 'Further information requested', value: 'requestedFurtherInformation' },
        { selected: false, text: APPLICATION_SUITABLE, value: 'pendingPlacementRequest' },
      ])
    })

    it('should return the selected status if provided', () => {
      expect(applicationStatusSelectOptions('awaitingPlacement')).toEqual([
        { selected: false, text: 'All statuses', value: '' },
        { selected: false, text: 'Application started', value: 'started' },
        { selected: false, text: 'Application submitted', value: 'submitted' },
        { selected: false, text: 'Application rejected', value: 'rejected' },
        { selected: false, text: 'Awaiting assessment', value: 'awaitingAssesment' },
        { selected: false, text: 'Unallocated assessment', value: 'unallocatedAssesment' },
        { selected: false, text: 'Assessment in progress', value: 'assesmentInProgress' },
        { selected: true, text: APPLICATION_SUITABLE, value: 'awaitingPlacement' },
        { selected: false, text: APPLICATION_SUITABLE, value: 'placementAllocated' },
        { selected: false, text: 'Application inapplicable', value: 'inapplicable' },
        { selected: false, text: 'Application withdrawn', value: 'withdrawn' },
        { selected: false, text: 'Further information requested', value: 'requestedFurtherInformation' },
        { selected: false, text: APPLICATION_SUITABLE, value: 'pendingPlacementRequest' },
      ])
    })
  })

  describe('appealDecisionRadioItems', () => {
    it('should return radio items when selectedOption is empty', () => {
      expect(appealDecisionRadioItems(undefined)).toEqual([
        {
          text: 'Appeal successful',
          value: 'accepted',
          checked: false,
          hint: {
            text: 'The original assessment will be overruled and a new assessment will be created and allocated to you',
          },
        },
        {
          text: 'Appeal unsuccessful',
          value: 'rejected',
          checked: false,
          hint: {
            text: 'The original assessment decision will stand and the application will remain rejected',
          },
        },
      ])
    })

    it('should return radio items when the the selected item checked', () => {
      expect(appealDecisionRadioItems('accepted')).toEqual([
        {
          text: 'Appeal successful',
          value: 'accepted',
          checked: true,
          hint: {
            text: 'The original assessment will be overruled and a new assessment will be created and allocated to you',
          },
        },
        {
          text: 'Appeal unsuccessful',
          value: 'rejected',
          checked: false,
          hint: {
            text: 'The original assessment decision will stand and the application will remain rejected',
          },
        },
      ])
    })
  })
})
