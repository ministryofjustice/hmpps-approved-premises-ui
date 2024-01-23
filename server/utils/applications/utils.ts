import type {
  ApplicationType,
  FormArtifact,
  FormPages,
  FormSections,
  JourneyType,
  PageResponse,
  SelectOption,
  SummaryListWithCard,
  TableCell,
  TableRow,
  UiTimelineEvent,
} from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApplicationSortField,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ApprovedPremisesApplicationStatus,
  Person,
  PlacementApplication,
  PlacementType,
  SortDirection,
  TimelineEvent,
  TimelineEventType,
  User,
} from '@approved-premises/api'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'
import Apply from '../../form-pages/apply'
import { isApplicableTier, isFullPerson, nameOrPlaceholderCopy, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import Assess from '../../form-pages/assess'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../retrieveQuestionResponseFromFormArtifact'
import ExceptionDetails from '../../form-pages/apply/reasons-for-placement/basic-information/exceptionDetails'
import { journeyTypeFromArtifact } from '../journeyTypeFromArtifact'
import PlacementRequest from '../../form-pages/placement-application'
import isAssessment from '../assessments/isAssessment'
import getAssessmentSections from '../assessments/getSections'
import { RestrictedPersonError } from '../errors'
import ReasonForPlacement, {
  reasons as reasonsDictionary,
} from '../../form-pages/placement-application/request-a-placement/reasonForPlacement'
import { durationAndArrivalDateFromPlacementApplication } from '../placementRequests/placementApplicationSubmissionData'
import { sortHeader } from '../sortHeader'

const applicationStatuses: Record<ApprovedPremisesApplicationStatus, string> = {
  started: 'Application started',
  submitted: 'Application submitted',
  rejected: 'Application rejected',
  awaitingAssesment: 'Awaiting assessment',
  unallocatedAssesment: 'Unallocated assessment',
  assesmentInProgress: 'Assessment in progress',
  awaitingPlacement: 'Awaiting placement',
  placementAllocated: 'Placement allocated',
  inapplicable: 'Application inapplicable',
  withdrawn: 'Application withdrawn',
  requestedFurtherInformation: 'Further information requested',
  pendingPlacementRequest: 'Pending placement request',
}

const applicationTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application),
    textValue(application.person.crn),
    htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
    textValue(getArrivalDateorNA(application.arrivalDate)),
    htmlValue(getStatus(application)),
    createWithdrawElement(application.id, application),
  ])
}

const dashboardTableHeader = (
  sortBy: ApplicationSortField,
  sortDirection: SortDirection,
  hrefPrefix: string,
): Array<TableCell> => {
  return [
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
  ]
}

const dashboardTableRows = (
  applications: Array<ApplicationSummary>,
  { linkInProgressApplications = true } = {},
): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application, { linkInProgressApplications }),
    textValue(application.person.crn),
    htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
    textValue(getArrivalDateorNA(application.arrivalDate)),
    textValue(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
    htmlValue(getStatus(application)),
  ])
}

const getTierOrBlank = (tier: string | null | undefined) => (tier ? tierBadge(tier) : '')

const getArrivalDateorNA = (arrivalDate: string | null | undefined) =>
  arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'

const statusTags = (): Record<ApprovedPremisesApplicationStatus, string> => {
  const colours: Record<ApprovedPremisesApplicationStatus, string> = {
    started: 'blue',
    submitted: '',
    rejected: 'red',
    awaitingAssesment: 'blue',
    unallocatedAssesment: 'blue',
    assesmentInProgress: 'blue',
    awaitingPlacement: 'blue',
    placementAllocated: 'pink',
    inapplicable: 'red',
    withdrawn: 'red',
    requestedFurtherInformation: 'yellow',
    pendingPlacementRequest: 'blue',
  }
  return Object.keys(applicationStatuses).reduce(
    (item, key) => {
      item[key] = `<strong class="govuk-tag govuk-tag--${colours[key]}">${applicationStatuses[key]}</strong>`
      return item
    },
    {} as Record<ApprovedPremisesApplicationStatus, string>,
  )
}

const getStatus = (application: ApplicationSummary): string => {
  return statusTags()[application.status]
}

export const textValue = (value: string) => {
  return { text: value }
}

export const htmlValue = (value: string) => {
  return { html: value }
}

const createNameAnchorElement = (
  person: Person,
  applicationSummary: ApplicationSummary,
  { linkInProgressApplications }: { linkInProgressApplications: boolean } = { linkInProgressApplications: true },
) => {
  if (!linkInProgressApplications && applicationSummary.status === 'started') {
    return textValue(nameOrPlaceholderCopy(person, `LAO: ${person.crn}`))
  }

  return isFullPerson(person)
    ? htmlValue(
        `<a href=${paths.applications.show({ id: applicationSummary.id })} data-cy-id="${applicationSummary.id}">${
          person.name
        }</a>`,
      )
    : textValue(`LAO CRN: ${person.crn}`)
}

export const unwithdrawableApplicationStatuses: Array<ApprovedPremisesApplicationStatus> = [
  'placementAllocated',
  'inapplicable',
  'withdrawn',
  'rejected',
]

export const createWithdrawElement = (applicationId: string, application: ApplicationSummary) => {
  if (unwithdrawableApplicationStatuses.includes(application.status)) return textValue('')

  return htmlValue(`<a href="${paths.applications.withdraw.new({ id: applicationId })}">Withdraw</a>`)
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

export const getSections = (formArtifact: FormArtifact): FormSections => {
  const journeyType = journeyTypeFromArtifact(formArtifact)

  switch (journeyType) {
    case 'applications':
      return Apply.sections.slice(0, -1)
    case 'assessments':
      if (!isAssessment(formArtifact)) throw new Error('Form artifact is not an assessment')
      return getAssessmentSections(formArtifact)
    case 'placement-applications':
      return PlacementRequest.sections
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

export const journeyPages = (journeyType: JourneyType): FormPages => {
  switch (journeyType) {
    case 'applications':
      return Apply.pages
    case 'assessments':
      return Assess.pages
    case 'placement-applications':
      return PlacementRequest.pages
    default:
      throw new Error(`Unknown journey type: ${journeyType}`)
  }
}

const isInapplicable = (application: Application): boolean => {
  const isExceptionalCase = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    IsExceptionalCase,
    'isExceptionalCase',
  )

  const agreedCaseWithManager = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    ExceptionDetails,
    'agreedCaseWithManager',
  )

  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromFormArtifact(
    application,
    MaleAp,
    'shouldPersonBePlacedInMaleAp',
  )

  if (isExceptionalCase === 'no') {
    return true
  }

  if (isExceptionalCase === 'yes' && agreedCaseWithManager === 'no') {
    return true
  }

  if (shouldPersonBePlacedInMaleAp === 'no') {
    return true
  }

  return false
}

const firstPageOfApplicationJourney = (application: Application) => {
  if (!isFullPerson(application.person)) throw new RestrictedPersonError(application.person.crn)

  if (!application?.risks?.tier?.value) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'enter-risk-level' })
  }

  if (!isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
  }

  return paths.applications.pages.show({
    id: application.id,
    task: 'basic-information',
    page: 'confirm-your-details',
  })
}

const getApplicationType = (application: Application): ApplicationType => {
  if (application.isPipeApplication) {
    return 'PIPE'
  }
  return 'Standard'
}

export const eventTypeTranslations: Record<TimelineEventType, string> = {
  approved_premises_application_submitted: 'Application submitted',
  approved_premises_application_assessed: 'Application assessed',
  approved_premises_booking_made: 'Booking made',
  approved_premises_person_arrived: 'Person arrived',
  approved_premises_person_not_arrived: 'Person not arrived',
  approved_premises_person_departed: 'Person departed',
  approved_premises_booking_not_made: 'Unable to match',
  approved_premises_booking_cancelled: 'Booking cancelled',
  approved_premises_booking_changed: 'Booking changed',
  approved_premises_application_withdrawn: 'Application withdrawn',
  approved_premises_information_request: 'Information request',
  application_timeline_note: 'Note added',
  cas3_person_arrived: 'CAS3 person arrived',
  cas3_person_departed: 'CAS3 person departed',
}

const mapTimelineEventsForUi = (timelineEvents: Array<TimelineEvent>): Array<UiTimelineEvent> => {
  return timelineEvents
    .sort((a, b) => Number(DateFormats.isoToDateObj(b.occurredAt)) - Number(DateFormats.isoToDateObj(a.occurredAt)))
    .map(timelineEvent => {
      const event = {
        label: { text: eventTypeTranslations[timelineEvent.type] },
        datetime: {
          timestamp: timelineEvent.occurredAt,
          date: DateFormats.isoDateTimeToUIDateTime(timelineEvent.occurredAt),
        },
        content: timelineEvent.content,
      }
      if (timelineEvent.createdBy?.name) {
        return {
          ...event,
          createdBy: timelineEvent.createdBy?.name,
        }
      }
      return event
    })
}

const mapPlacementApplicationToSummaryCards = (
  placementApplications: Array<PlacementApplication>,
  application: Application,
  actingUser: User,
): Array<SummaryListWithCard> => {
  return placementApplications.map(placementApplication => {
    const reasonForPlacement = retrieveOptionalQuestionResponseFromFormArtifact(
      placementApplication,
      ReasonForPlacement,
      'reason',
    ) as PlacementType

    const datesOfPlacements = durationAndArrivalDateFromPlacementApplication(
      placementApplication,
      reasonForPlacement,
      application,
    )

    const actionItems = []

    if (placementApplication?.canBeWithdrawn && placementApplication.createdByUserId === actingUser.id) {
      actionItems.push({
        href: placementApplicationPaths.placementApplications.withdraw.new({
          id: placementApplications[0].id,
        }),
        text: 'Withdraw',
      })
    }

    return {
      card: {
        title: {
          text: DateFormats.isoDateToUIDate(placementApplication.createdAt),
          headingLevel: '3',
        },
        attributes: {
          'data-cy-placement-application-id': placementApplication.id,
        },
        actions: {
          items: actionItems,
        },
      },
      rows: [
        {
          key: { text: 'Reason for placement request' },
          value: { text: reasonsDictionary[reasonForPlacement] || 'None supplied' },
        },
        ...datesOfPlacements
          .map(({ expectedArrival, duration }) => {
            return [
              {
                key: { text: 'Arrival date' },
                value: {
                  text: expectedArrival ? DateFormats.isoDateToUIDate(expectedArrival) : 'None supplied',
                },
              },
              {
                key: { text: 'Length of stay' },
                value: {
                  text: lengthOfStayForUI(duration),
                },
              },
            ]
          })
          .flat(),
      ],
    }
  })
}

const lengthOfStayForUI = (duration: number) => {
  if (duration === 0 || duration) {
    return `${duration} day${duration === 1 ? '' : 's'}`
  }

  return 'None supplied'
}

export const applicationShowPageTabs = {
  application: 'application',
  timeline: 'timeline',
  placementRequests: 'placementRequests',
}

export type ApplicationShowPageTab = keyof typeof applicationShowPageTabs

export const applicationShowPageTab = (id: Application['id'], tab: ApplicationShowPageTab) =>
  `${paths.applications.show({ id })}?tab=${applicationShowPageTabs[tab]}`

const applicationStatusSelectOptions = (
  selectedOption: ApprovedPremisesApplicationStatus | undefined | null,
): Array<SelectOption> => {
  const options = Object.keys(applicationStatuses).map(status => ({
    text: applicationStatuses[status],
    value: status,
    selected: status === selectedOption,
  }))

  options.unshift({
    text: 'All statuses',
    value: '',
    selected: !selectedOption,
  })

  return options
}

export {
  applicationStatuses,
  applicationTableRows,
  dashboardTableRows,
  dashboardTableHeader,
  firstPageOfApplicationJourney,
  arrivalDateFromApplication,
  getApplicationType,
  getStatus,
  isInapplicable,
  mapTimelineEventsForUi,
  mapPlacementApplicationToSummaryCards,
  lengthOfStayForUI,
  statusTags,
  applicationStatusSelectOptions,
}
