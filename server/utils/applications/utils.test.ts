import {
  ApType,
  ApplicationSortField,
  ApprovedPremisesApplicationStatus as ApplicationStatus,
  Cas1TimelineEventUrlType,
  FullPerson,
} from '@approved-premises/api'
import { isAfter } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ApplicationType, TaskNames } from '@approved-premises/ui'
import { mockOptionalQuestionResponse } from '../../testutils/mockQuestionResponse'
import {
  applicationFactory,
  applicationSummaryFactory,
  applicationTimelineFactory,
  assessmentFactory,
  cas1TimelineEventFactory,
  personFactory,
  personalTimelineFactory,
  placementApplicationFactory,
  restrictedPersonFactory,
  tierEnvelopeFactory,
} from '../../testutils/factories'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import PlacementRequest from '../../form-pages/placement-application'
import { DateFormats } from '../dateUtils'
import * as personUtils from '../personUtils'

import {
  actionsLink,
  appealDecisionRadioItems,
  applicationStatusSelectOptions,
  applicationSuitableStatuses,
  applicationTableRows,
  dashboardTableHeader,
  dashboardTableRows,
  eventTypeTranslations,
  firstPageOfApplicationJourney,
  getApplicationType,
  getSections,
  isInapplicable,
  isWomensApplication,
  lengthOfStayForUI,
  mapApplicationTimelineEventsForUi,
  mapPersonalTimelineForUi,
  mapTimelineUrlsForUi,
  tierQualificationPage,
} from './utils'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import { RestrictedPersonError } from '../errors'
import { sortHeader } from '../sortHeader'
import { APPLICATION_SUITABLE, ApplicationStatusTag } from './statusTag'
import { renderTimelineEventContent } from '../timeline'

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

const applySection1Task1 = {
  id: 'first-apply-section-task-1' as TaskNames,
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2 = {
  id: 'first-apply-section-task-2' as TaskNames,
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1' as TaskNames,
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2' as TaskNames,
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

Apply.pages['first-apply-section-task-1' as TaskNames] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

const assessSection1Task1 = {
  id: 'first-assess-section-task-1' as TaskNames,
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2' as TaskNames,
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1' as TaskNames,
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2' as TaskNames,
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

Assess.pages['assess-page' as TaskNames] = {
  first: AssessPage,
}

PlacementRequest.pages['placement-request-page' as TaskNames] = {
  first: PlacementRequestPage,
}

describe('utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(personUtils, 'tierBadge')
  })

  describe('applicationTableRows', () => {
    const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))
    const person = personFactory.build()

    it('returns an array of applications as table rows', async () => {
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
            html: personUtils.tierBadge('A1'),
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
          { html: actionsLink(applicationA) },
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
          { html: actionsLink(applicationB) },
        ],
      ])
    })

    describe('when tier is undefined', () => {
      it('returns a blank tier badge', async () => {
        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: { tier: undefined },
          status: 'started',
        })

        const result = applicationTableRows([application])

        expect(personUtils.tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })

    describe('when risks is undefined', () => {
      it('returns a blank tier badge', async () => {
        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: undefined,
        })

        const result = applicationTableRows([application])

        expect(personUtils.tierBadge).not.toHaveBeenCalled()

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
            html: personUtils.tierBadge('A1'),
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
            html: actionsLink(applicationA),
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
            html: actionsLink(applicationB),
          },
        ],
      ])
    })

    describe('when tier is undefined', () => {
      it('returns a blank tier badge', async () => {
        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: { tier: undefined },
          status: 'started',
        })

        const result = dashboardTableRows([application])

        expect(personUtils.tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })

    describe('when risks is undefined', () => {
      it('returns a blank tier badge', async () => {
        const application = applicationSummaryFactory.build({
          arrivalDate,
          person,
          risks: undefined,
        })

        const result = dashboardTableRows([application])

        expect(personUtils.tierBadge).not.toHaveBeenCalled()

        expect(result[0][2]).toEqual({
          html: '',
        })
      })
    })

    describe('when linkInProgressApplications is false', () => {
      it('returns the rows with the name cell without linking to the application', () => {
        const application = applicationSummaryFactory.build({ person })

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
              html: personUtils.tierBadge(application.tier),
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
              html: actionsLink(application),
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
      jest.spyOn(personUtils, 'isApplicableTier').mockReturnValue(true)
      const application = applicationFactory.withFullPerson().build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'confirm-your-details' }),
      )
    })

    it('returns the "enter risk level" page for an application for a person without a tier', () => {
      const application = applicationFactory.withFullPerson().build({
        risks: undefined,
      })

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'enter-risk-level' }),
      )
    })

    it('returns the is exceptional case page for an application with an unsuitable tier', () => {
      jest.spyOn(personUtils, 'isApplicableTier').mockReturnValue(false)
      const application = applicationFactory.withFullPerson().build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('throws an error if the person is not a Full Person', () => {
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

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      mockOptionalQuestionResponse({})

      expect(isInapplicable(application)).toEqual(false)
    })
  })

  describe('isWomensApplication', () => {
    it.each([
      ['Male', 'yes', 'yes', 'yes', 'yes', false],
      ['Female', 'yes', 'yes', 'yes', 'yes', false],
      ['Male', 'yes', 'yes', 'yes', 'no', true],
      ['Female', 'yes', 'yes', 'yes', 'no', true],
      ['Male', 'no', undefined, undefined, undefined, false],
      ['Female', 'no', undefined, undefined, undefined, true],
      ['Male', 'yes', 'no', undefined, undefined, false],
      ['Male', 'yes', 'yes', 'no', undefined, false],
      ['Male', 'no', 'yes', 'yes', 'yes', false],
      ['Male', 'yes', 'no', 'yes', 'yes', false],
      ['Male', 'yes', 'yes', 'no', 'yes', false],
    ])(
      'Person is %s, is transgender:%s, caseboard:%s, has met:%s, result-male:%s should return %s',
      (sex, isTrans, reviewRequired, hasBoardTakenPlace, caseBoardSaysMale, expected) => {
        const application = applicationFactory.build()
        const fp = application.person as FullPerson
        fp.sex = sex
        mockOptionalQuestionResponse({
          transgenderOrHasTransgenderHistory: isTrans,
          shouldPersonBePlacedInMaleAp: caseBoardSaysMale,
          reviewRequired,
          hasBoardTakenPlace,
        })
        expect(isWomensApplication(application)).toEqual(expected)
      },
    )
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
    it.each(['started', 'requestedFurtherInformation'] as const)(
      'returns a link to withdraw the application when the status is %s',
      (status: ApplicationStatus) => {
        const applicationSummary = applicationSummaryFactory.build({
          id: 'an-application-id',
          status,
          hasRequestsForPlacement: false,
        })

        expect(actionsLink(applicationSummary)).toBe(
          '<a href="/applications/an-application-id/withdrawals/new"  >Withdraw</a>',
        )
      },
    )

    it.each(['awaitingPlacement', 'pendingPlacementRequest'] as const)(
      'returns a link to request for placement of the application when the status is %s and hasRequestsForPlacement is false',
      status => {
        const applicationSummary = applicationSummaryFactory.build({
          id: 'an-application-id',
          status,
          hasRequestsForPlacement: false,
        })

        expect(actionsLink(applicationSummary)).toEqual(
          '<a href="/placement-applications?id=an-application-id"  >Create request for placement</a>',
        )
      },
    )

    it.each(['rejected', 'withdrawn', 'submitted'])(
      'does not return a link to withdraw the application if the status is %s',
      (status: ApplicationStatus) => {
        const applicationSummary = applicationSummaryFactory.build({
          id: 'an-application-id',
          status,
          hasRequestsForPlacement: false,
        })

        expect(actionsLink(applicationSummary)).toBe('')
      },
    )
  })

  describe('mapApplicationTimelineEventsForUi', () => {
    it('maps the events into the format required by the MoJ UI Timeline component', () => {
      const timelineEvents = cas1TimelineEventFactory.buildList(1, { triggerSource: 'user' })

      expect(mapApplicationTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: renderTimelineEventContent(timelineEvents[0]),
          createdBy: timelineEvents[0].createdBySummary.name,
          associatedUrls: expect.arrayContaining(
            mapTimelineUrlsForUi([
              {
                type: timelineEvents[0].associatedUrls[0].type,
                url: timelineEvents[0].associatedUrls[0].url,
              },
            ]),
          ),
        },
      ])
    })

    it('maps the events into the format required by the MoJ UI Timeline component without associatedUrls', () => {
      const timelineEvents = cas1TimelineEventFactory.buildList(1, { associatedUrls: undefined, triggerSource: 'user' })

      expect(mapApplicationTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: renderTimelineEventContent(timelineEvents[0]),
          createdBy: timelineEvents[0].createdBySummary.name,
          associatedUrls: [],
        },
      ])
    })

    it('sorts the events in ascending order', () => {
      const timelineEvents = cas1TimelineEventFactory.buildList(3)

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
      const timelineEventWithoutOccurredAt = cas1TimelineEventFactory.build({ occurredAt: undefined })
      const pastTimelineEvent = cas1TimelineEventFactory.build({
        occurredAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
      })
      const futureTimelineEvent = cas1TimelineEventFactory.build({
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
      const timelineEventWithRogueHTML = cas1TimelineEventFactory.build({
        content: '<div>Hello!</div>',
        payload: undefined,
      })

      const actual = mapApplicationTimelineEventsForUi([timelineEventWithRogueHTML])

      expect(actual[0].content).toEqual('<p class="govuk-body">&lt;div&gt;Hello!&lt;/div&gt;</p>')
    })

    it('Sets createdBy to System if triggerSource is `system`', () => {
      const timelineEvents = cas1TimelineEventFactory.buildList(1, { triggerSource: 'system' })

      expect(mapApplicationTimelineEventsForUi(timelineEvents)).toEqual([
        {
          datetime: {
            timestamp: timelineEvents[0].occurredAt,
            date: DateFormats.isoDateTimeToUIDateTime(timelineEvents[0].occurredAt),
          },
          label: {
            text: eventTypeTranslations[timelineEvents[0].type],
          },
          content: renderTimelineEventContent(timelineEvents[0]),
          createdBy: 'System',
          associatedUrls: expect.arrayContaining(
            mapTimelineUrlsForUi([
              {
                type: timelineEvents[0].associatedUrls[0].type,
                url: timelineEvents[0].associatedUrls[0].url,
              },
            ]),
          ),
        },
      ])
    })
  })

  describe('mapTimelineUrlsForUi', () => {
    it.each([
      ['application', 'application'],
      ['assessment', 'assessment'],
      ['booking', 'placement'],
      ['assessmentAppeal', 'appeal'],
      ['spaceBooking', 'placement'],
    ])('Translates a "%s" url type to "%s"', (urlType: Cas1TimelineEventUrlType, translation: string) => {
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
        { selected: false, text: 'Application inapplicable', value: 'inapplicable' },
        { selected: false, text: 'Not submitted', value: 'started' },
        { selected: false, text: 'Unallocated assessment', value: 'unallocatedAssesment' },
        { selected: false, text: 'Awaiting assessment', value: 'awaitingAssesment' },
        { selected: false, text: 'Assessment in progress', value: 'assesmentInProgress' },
        { selected: false, text: 'Further information requested', value: 'requestedFurtherInformation' },
        { selected: false, text: 'Application rejected', value: 'rejected' },
        {
          selected: false,
          text: APPLICATION_SUITABLE,
          value: applicationSuitableStatuses,
        },
        { selected: false, text: 'Application withdrawn', value: 'withdrawn' },
      ])
    })

    it('should return the selected status if provided', () => {
      expect(applicationStatusSelectOptions('awaitingAssesment')).toEqual([
        { selected: false, text: 'All statuses', value: '' },
        { selected: false, text: 'Application inapplicable', value: 'inapplicable' },
        { selected: false, text: 'Not submitted', value: 'started' },
        { selected: false, text: 'Unallocated assessment', value: 'unallocatedAssesment' },
        { selected: true, text: 'Awaiting assessment', value: 'awaitingAssesment' },
        { selected: false, text: 'Assessment in progress', value: 'assesmentInProgress' },
        { selected: false, text: 'Further information requested', value: 'requestedFurtherInformation' },
        { selected: false, text: 'Application rejected', value: 'rejected' },
        {
          selected: false,
          text: APPLICATION_SUITABLE,
          value: applicationSuitableStatuses,
        },
        { selected: false, text: 'Application withdrawn', value: 'withdrawn' },
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

  describe('tierQualificationPage', () => {
    it('returns undefined for valid tier', () => {
      jest.spyOn(personUtils, 'isApplicableTier').mockReturnValue(true)
      const application = applicationFactory.withFullPerson().build()

      expect(tierQualificationPage(application)).toBe(undefined)
    })

    it('returns the "enter risk level" page for an application for a person without a tier', () => {
      const application = applicationFactory.withFullPerson().build({
        risks: undefined,
      })

      expect(tierQualificationPage(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'enter-risk-level' }),
      )
    })

    it('returns the is exceptional case page for an application with an unsuitable tier', () => {
      jest.spyOn(personUtils, 'isApplicableTier').mockReturnValue(false)
      const application = applicationFactory.withFullPerson().build()

      expect(tierQualificationPage(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })

    it('throws an error if the person is not a Full Person', () => {
      const restrictedPerson = restrictedPersonFactory.build()
      const application = applicationFactory.build({ person: restrictedPerson })

      expect(() => tierQualificationPage(application)).toThrowError(`CRN: ${restrictedPerson.crn} is restricted`)
      expect(() => tierQualificationPage(application)).toThrowError(RestrictedPersonError)
    })
  })
})
