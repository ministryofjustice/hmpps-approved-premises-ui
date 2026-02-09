import type {
  ApplicationType,
  FormArtifact,
  FormPages,
  FormSections,
  GroupedApplications,
  JourneyType,
  PageResponse,
  RequestWithSession,
  SelectOption,
  TableCell,
  TableRow,
  UiTimelineEvent,
} from '@approved-premises/ui'
import type {
  AppealDecision,
  Cas1Application as Application,
  ApplicationSortField,
  Cas1ApplicationStatus as ApplicationStatus,
  Cas1PersonalTimeline,
  Cas1TimelineEvent,
  Cas1TimelineEventAssociatedUrl,
  Cas1TimelineEventType,
  Cas1TimelineEventUrlType,
  SortDirection,
  Cas1ApplicationSummary,
  ApprovedPremisesApplication,
} from '@approved-premises/api'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'

import placementApplicationPaths from '../../paths/placementApplications'
import Apply from '../../form-pages/apply'
import { displayName, isApplicableTier, isFullPerson, PersonAny } from '../personUtils'
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
import { sortHeader } from '../sortHeader'
import { linkTo } from '../utils'
import { createNameAnchorElement, getTierOrBlank } from './helpers'
import { APPLICATION_SUITABLE, ApplicationStatusTag, applicationSuitableStatuses } from './statusTag'
import { renderTimelineEventContent } from '../timeline'
import { summaryListItem } from '../formUtils'
import { htmlCell, textCell } from '../tableUtils'
import { getPlacementLink } from '../resident'

export { withdrawableTypeRadioOptions, withdrawableRadioOptions } from './withdrawables'
export { placementApplicationWithdrawalReasons } from './withdrawables/withdrawalReasons'
export { applicationIdentityBar } from './applicationIdentityBar'
export {
  pendingPlacementRequestTableHeader,
  pendingPlacementRequestTableRows,
  releaseTypeSelectOptions,
} from './pendingPlacementRequestTable'
export { isWomensApplication } from './isWomensApplication'

const applicationTableRows = (applications: Array<Cas1ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    {
      ...createNameAnchorElement(application.person, application),
      attributes: { 'data-sort-value': displayName(application.person) },
    },
    textCell(application.person.crn),
    htmlCell(getTierOrBlank(application.risks?.tier?.value?.level)),
    {
      ...textCell(getArrivalDateorNA(application.arrivalDate)),
      attributes: { 'data-sort-value': application.arrivalDate || '' },
    },
    {
      ...textCell(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
      attributes: { 'data-sort-value': application.createdAt },
    },
    htmlCell(new ApplicationStatusTag(application.status).html()),
    htmlCell(actionsLink(application)),
  ])
}

export const applicationsTabs = (applications: GroupedApplications) => [
  {
    label: 'In progress',
    id: 'applications',
    rows: applicationTableRows(applications.inProgress),
  },
  {
    label: 'Further information requested',
    id: 'further-information-requested',
    rows: applicationTableRows(applications.requestedFurtherInformation),
  },
  {
    label: 'Submitted',
    id: 'applications-submitted',
    rows: applicationTableRows(applications.submitted),
  },
  {
    label: 'Inactive',
    id: 'inactive',
    rows: applicationTableRows(applications.inactive),
  },
]

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
    {
      text: 'Actions',
    },
  ]
}

const dashboardTableRows = (
  applications: Array<Cas1ApplicationSummary>,
  { linkInProgressApplications = true } = {},
): Array<TableRow> => {
  return applications.map(
    (application): TableRow => [
      createNameAnchorElement(application.person, application, { linkInProgressApplications }),
      textCell(application.person.crn),
      htmlCell(getTierOrBlank(application.risks?.tier?.value?.level)),
      textCell(getArrivalDateorNA(application.arrivalDate)),
      textCell(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
      htmlCell(new ApplicationStatusTag(application.status).html()),
      htmlCell(actionsLink(application)),
    ],
  )
}

const getArrivalDateorNA = (arrivalDate: string | null | undefined) =>
  arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'

export const getApplicationSummary = (application: ApprovedPremisesApplication) => [
  summaryListItem('Created on', application.createdAt, 'date'),
  summaryListItem('Created by', application.createdByUserName),
  summaryListItem('Requested arrival date', application.arrivalDate, 'date'),
  summaryListItem('Status', new ApplicationStatusTag(application.status).html(), 'html'),
]

export const actionsLink = (application: Cas1ApplicationSummary) => {
  if (application.hasRequestsForPlacement) {
    return linkTo(paths.applications.show({ id: application.id }), {
      text: 'View placement request(s)',
      query: { tab: 'placementRequests' },
    })
  }

  if (application.status === 'started' || application.status === 'requestedFurtherInformation') {
    return linkTo(paths.applications.withdraw.new({ id: application.id }), { text: 'Withdraw' })
  }

  if (applicationSuitableStatuses.includes(application.status) && !application.hasRequestsForPlacement) {
    return linkTo(placementApplicationPaths.placementApplications.create({}), {
      text: 'Create placement request',
      query: { id: application.id },
    })
  }

  return ''
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

  return isExceptionalCase === 'no' || (isExceptionalCase === 'yes' && agreedCaseWithManager === 'no')
}

const tierQualificationPage = (application: Application) => {
  if (!isFullPerson(application.person)) throw new RestrictedPersonError(application.person.crn)

  if (!application?.risks?.tier?.value) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'enter-risk-level' })
  }

  if (!isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
  }
  return undefined
}

const firstPageOfApplicationJourney = (application: Application) => {
  const firstPage = tierQualificationPage(application)

  if (firstPage) {
    return firstPage
  }

  return paths.applications.pages.show({
    id: application.id,
    task: 'basic-information',
    page: 'confirm-your-details',
  })
}

const getApplicationType = (application: Application): ApplicationType => {
  switch (application.apType) {
    case 'esap':
      return 'ESAP'
    case 'mhapElliottHouse':
      return 'MHAP (Elliott House)'
    case 'mhapStJosephs':
      return 'MHAP (St Josephs)'
    case 'pipe':
      return 'PIPE'
    case 'rfap':
      return 'RFAP'
    default:
      return 'Standard'
  }
}

export const eventTypeTranslations: Record<Cas1TimelineEventType, string> = {
  application_submitted: 'Application submitted',
  application_assessed: 'Application assessed',
  application_expired: 'Application expired',
  application_manually_expired: 'Application manually expired',
  assessment_appealed: 'Application appealed',
  booking_made: 'Placement made',
  booking_keyworker_assigned: 'Key worker assigned',
  person_arrived: 'Person arrived',
  person_not_arrived: 'Person not arrived',
  person_departed: 'Person departed',
  booking_not_made: 'Unable to book',
  booking_cancelled: 'Placement cancelled',
  booking_changed: 'Placement changed',
  application_withdrawn: 'Application withdrawn',
  placement_application_allocated: 'Request for placement allocated',
  placement_application_withdrawn: 'Request for placement withdrawn',
  information_request: 'Information request',
  assessment_allocated: 'Assessment allocated',
  request_for_placement_created: 'Placement requested',
  request_for_placement_assessed: 'Request for placement assessed',
  application_timeline_note: 'Note added',
  match_request_withdrawn: 'Request for placement withdrawn',
  placement_change_request_created: 'Placement change request created',
  placement_change_request_rejected: 'Placement change request rejected',
}

const mapApplicationTimelineEventsForUi = (
  timelineEvents: Array<Cas1TimelineEvent>,
  params: { hideUrls?: boolean; person?: PersonAny; request?: RequestWithSession } = { hideUrls: false },
): Array<UiTimelineEvent> => {
  const { hideUrls } = params
  return timelineEvents
    .sort((a, b) => {
      if (b?.occurredAt && a?.occurredAt) {
        return Number(DateFormats.isoToDateObj(b.occurredAt)) - Number(DateFormats.isoToDateObj(a.occurredAt))
      }
      return 1
    })
    .map(timelineEvent => {
      const event: UiTimelineEvent = {
        label: { text: eventTypeTranslations[timelineEvent.type] },
        datetime: {
          timestamp: timelineEvent.occurredAt,
          date: timelineEvent.occurredAt ? DateFormats.isoDateTimeToUIDateTime(timelineEvent.occurredAt) : '',
        },
        content: renderTimelineEventContent(timelineEvent),
      }
      if (!hideUrls) {
        event.associatedUrls = timelineEvent.associatedUrls
          ? mapTimelineUrlsForUi(timelineEvent.associatedUrls, params.person, params.request)
          : []
      }

      const createdBy = timelineEvent.triggerSource === 'system' ? 'System' : timelineEvent.createdBySummary?.name
      if (createdBy) {
        return {
          ...event,
          createdBy,
        }
      }
      return event
    })
}

const mapTimelineUrlsForUi = (
  timelineUrls: Array<Cas1TimelineEventAssociatedUrl>,
  person?: PersonAny,
  request?: RequestWithSession,
) => {
  return timelineUrls.map(item => {
    let { url } = item
    if (item.type === 'spaceBooking' && person && request) {
      const match = /\/premises\/([0-9a-fA-F-]+)\/placements\/([0-9a-fA-F-]+)/.exec(item.url)
      const [, premisesId, placementId] = match || []
      url = getPlacementLink({ request, premisesId, person, placementId })
    }

    return { url, type: urlTypeForUi(item.type) }
  })
}

const mapPersonalTimelineForUi = (personalTimeline: Cas1PersonalTimeline, request: RequestWithSession) => {
  return personalTimeline.applications.map(applicationTimeline => {
    return {
      ...applicationTimeline,
      timelineEvents: mapApplicationTimelineEventsForUi(applicationTimeline.timelineEvents, {
        request,
        person: personalTimeline.person,
      }),
    }
  })
}

const urlTypeForUi = (type: Cas1TimelineEventUrlType) => {
  const translations: Record<Cas1TimelineEventUrlType, string> = {
    application: 'application',
    assessment: 'assessment',
    assessmentAppeal: 'appeal',
    spaceBooking: 'placement',
  }
  return translations[type]
}

export const withdrawnStatusTag = {
  key: { text: 'Status' },
  value: {
    html: `<strong class="govuk-tag govuk-tag--nowrap govuk-tag--red">
        Withdrawn
      </strong>`,
  },
}

const lengthOfStayForUI = (duration: number) => {
  if (duration === 0 || duration) {
    return `${duration} day${duration === 1 ? '' : 's'}`
  }

  return 'None supplied'
}
export type ApplicationShowPageTab = 'application' | 'assessment' | 'placementRequests' | 'timeline'

const tabLabels: Record<ApplicationShowPageTab, string> = {
  application: 'Application',
  assessment: 'Assessment',
  placementRequests: 'Placement requests',
  timeline: 'Timeline',
}

export const applicationShowPageTab = (applicationId: string, tab: ApplicationShowPageTab): string =>
  `${paths.applications.show({ id: applicationId })}?tab=${tab}`

export const getApplicationShowPageTabs = (applicationId: string, tab: ApplicationShowPageTab) => {
  return Object.entries(tabLabels).map(([tabKey, text]: [ApplicationShowPageTab, string]) => {
    return {
      text,
      href: applicationShowPageTab(applicationId, tabKey),
      active: tab === tabKey,
    }
  })
}

export type ApplicationStatusForFilter = ApplicationStatus | typeof applicationSuitableStatuses

const applicationStatusSelectOptions = (selectedOption?: ApplicationStatusForFilter): Array<SelectOption> => {
  const statusFilters: ReadonlyArray<ApplicationStatus> = [
    'inapplicable',
    'started',
    'unallocatedAssesment',
    'awaitingAssesment',
    'assesmentInProgress',
    'requestedFurtherInformation',
    'rejected',
    'withdrawn',
    'expired',
  ]

  const options: Array<SelectOption> = statusFilters.map(status => ({
    text: ApplicationStatusTag.statuses[status],
    value: status,
    selected: status === selectedOption,
  }))

  options.splice(7, 0, {
    text: APPLICATION_SUITABLE,
    value: applicationSuitableStatuses,
    selected: selectedOption === applicationSuitableStatuses.toString(),
  })

  options.unshift({
    text: 'All statuses',
    value: '',
    selected: !selectedOption,
  })

  return options
}

const appealDecisionRadioItems = (selectedOption: AppealDecision | undefined) => {
  const appealDecisions: Record<AppealDecision, string> = {
    accepted: 'Appeal successful',
    rejected: 'Appeal unsuccessful',
  }

  return Object.keys(appealDecisions).map((status: AppealDecision) => ({
    text: appealDecisions[status],
    value: status,
    checked: status === selectedOption,
    hint: {
      text:
        status === 'accepted'
          ? 'The original assessment will be overruled and a new assessment will be created and allocated to you'
          : 'The original assessment decision will stand and the application will remain rejected',
    },
  }))
}

export {
  applicationTableRows,
  dashboardTableRows,
  dashboardTableHeader,
  firstPageOfApplicationJourney,
  arrivalDateFromApplication,
  getApplicationType,
  isInapplicable,
  mapApplicationTimelineEventsForUi,
  mapTimelineUrlsForUi,
  mapPersonalTimelineForUi,
  lengthOfStayForUI,
  applicationStatusSelectOptions,
  appealDecisionRadioItems,
  tierQualificationPage,
  applicationSuitableStatuses,
}
