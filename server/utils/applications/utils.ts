import type {
  ApplicationType,
  FormArtifact,
  FormPages,
  FormSections,
  JourneyType,
  PageResponse,
  SelectOption,
  SummaryListItem,
  SummaryListWithCard,
  TableCell,
  TableRow,
  UiTimelineEvent,
} from '@approved-premises/ui'
import type {
  AppealDecision,
  ApprovedPremisesApplication as Application,
  ApplicationSortField,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ApprovedPremisesApplicationStatus,
  ApprovedPremisesApplicationSummary,
  PersonalTimeline,
  PlacementApplication,
  PlacementType,
  SortDirection,
  TimelineEvent,
  TimelineEventAssociatedUrl,
  TimelineEventType,
  TimelineEventUrlType,
  User,
} from '@approved-premises/api'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'

import placementApplicationPaths from '../../paths/placementApplications'
import Apply from '../../form-pages/apply'
import { isApplicableTier, isFullPerson } from '../personUtils'
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
import { linkTo } from '../utils'
import { createNameAnchorElement, getTierOrBlank, htmlValue, textValue } from './helpers'
import { escape } from '../formUtils'
import { ApplicationStatusTag } from './statusTag'

export { withdrawableTypeRadioOptions, withdrawableRadioOptions } from './withdrawables'
export { placementApplicationWithdrawalReasons } from './withdrawables/withdrawalReasons'
export { applicationIdentityBar } from './applicationIdentityBar'
export { pendingPlacementRequestTableHeader, pendingPlacementRequestTableRows } from './pendingPlacementRequestTable'

const applicationTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => [
    createNameAnchorElement(application.person, application),
    textValue(application.person.crn),
    htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
    textValue(getArrivalDateorNA(application.arrivalDate)),
    textValue(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
    htmlValue(new ApplicationStatusTag(application.status).html()),
    actionsCell(application),
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
    {
      text: 'Actions',
    },
  ]
}

const dashboardTableRows = (
  applications: Array<ApplicationSummary>,
  { linkInProgressApplications = true } = {},
): Array<TableRow> => {
  return applications.map(
    (application): TableRow => [
      createNameAnchorElement(application.person, application, { linkInProgressApplications }),
      textValue(application.person.crn),
      htmlValue(getTierOrBlank(application.risks?.tier?.value?.level)),
      textValue(getArrivalDateorNA(application.arrivalDate)),
      textValue(DateFormats.isoDateToUIDate(application.createdAt, { format: 'short' })),
      htmlValue(new ApplicationStatusTag(application.status).html()),
      htmlValue(getAction(application)),
    ],
  )
}

export const getAction = (application: ApplicationSummary | Application) => {
  if ((application as ApprovedPremisesApplicationSummary).hasRequestsForPlacement) {
    return linkTo(
      paths.applications.show,
      { id: application.id },
      { text: 'View placement request(s)', query: { tab: applicationShowPageTabs.placementRequests } },
    )
  }
  if (application.status === 'awaitingPlacement') {
    return linkTo(
      placementApplicationPaths.placementApplications.create,
      {},
      { text: 'Request for placement', query: { id: application.id } },
    )
  }
  return ''
}

const getArrivalDateorNA = (arrivalDate: string | null | undefined) =>
  arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'

export const actionsCell = (application: ApplicationSummary) => {
  const actionItems: Array<string> = []

  if (application.status === 'started' || application.status === 'requestedFurtherInformation') {
    const withdrawLink = linkTo(paths.applications.withdraw.new, { id: application.id }, { text: 'Withdraw' })

    actionItems.push(withdrawLink)
  }

  if (application.status === 'awaitingPlacement') {
    const requestForPlacementLink = linkTo(
      placementApplicationPaths.placementApplications.create,
      {},
      { text: 'Request for placement', query: { id: application.id } },
    )
    actionItems.push(requestForPlacementLink)
  }
  const actionLinks = actionItems.length
    ? `<ul class="govuk-list">${actionItems.map(actionItem => `<li>${actionItem}</li>`).join('')}</ul>`
    : ''

  return htmlValue(actionLinks)
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
  if (application.isEsapApplication) {
    return 'ESAP'
  }
  if (application.isPipeApplication) {
    return 'PIPE'
  }

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

export const eventTypeTranslations: Record<TimelineEventType, string> = {
  approved_premises_application_submitted: 'Application submitted',
  approved_premises_application_assessed: 'Application assessed',
  approved_premises_assessment_appealed: 'Application appealed',
  approved_premises_booking_made: 'Placement made',
  approved_premises_person_arrived: 'Person arrived',
  approved_premises_person_not_arrived: 'Person not arrived',
  approved_premises_person_departed: 'Person departed',
  approved_premises_booking_not_made: 'Unable to match',
  approved_premises_booking_cancelled: 'Placement cancelled',
  approved_premises_booking_changed: 'Placement changed',
  approved_premises_application_withdrawn: 'Application withdrawn',
  approved_premises_placement_application_allocated: 'Request for placement allocated',
  approved_premises_placement_application_withdrawn: 'Request for placement withdrawn',
  approved_premises_information_request: 'Information request',
  approved_premises_assessment_allocated: 'Assessment allocated',
  approved_premises_request_for_placement_created: 'Placement requested',
  application_timeline_note: 'Note added',
  cas3_person_arrived: 'CAS3 person arrived',
  cas3_person_departed: 'CAS3 person departed',
  cas2_application_submitted: 'CAS2 application submitted',
  cas2_note: 'CAS2 note added',
  cas2_status_update: 'CAS2 status updated',
  approved_premises_match_request_withdrawn: 'Request for placement withdrawn',
}

const mapApplicationTimelineEventsForUi = (timelineEvents: Array<TimelineEvent>): Array<UiTimelineEvent> => {
  return timelineEvents
    .sort((a, b) => {
      if (b?.occurredAt && a?.occurredAt) {
        return Number(DateFormats.isoToDateObj(b.occurredAt)) - Number(DateFormats.isoToDateObj(a.occurredAt))
      }
      return 1
    })
    .map(timelineEvent => {
      const event = {
        label: { text: eventTypeTranslations[timelineEvent.type] },
        datetime: {
          timestamp: timelineEvent.occurredAt,
          date: timelineEvent.occurredAt ? DateFormats.isoDateTimeToUIDateTime(timelineEvent.occurredAt) : '',
        },
        content: escape(timelineEvent.content),
        associatedUrls: timelineEvent.associatedUrls ? mapTimelineUrlsForUi(timelineEvent.associatedUrls) : [],
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

const mapTimelineUrlsForUi = (timelineUrls: Array<TimelineEventAssociatedUrl>) => {
  return timelineUrls.map(item => ({ url: item.url, type: urlTypeForUi(item.type) }))
}

const mapPersonalTimelineForUi = (personalTimeline: PersonalTimeline) => {
  return personalTimeline.applications.map(applicationTimeline => {
    return {
      ...applicationTimeline,
      timelineEvents: mapApplicationTimelineEventsForUi(applicationTimeline.timelineEvents),
    }
  })
}

const urlTypeForUi = (type: TimelineEventUrlType) => {
  const translations: Record<TimelineEventUrlType, string> = {
    application: 'application',
    assessment: 'assessment',
    booking: 'placement',
    assessmentAppeal: 'appeal',
  }
  return translations[type]
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

    const datesOfPlacements = placementApplication?.placementDates?.length
      ? placementApplication?.placementDates
      : durationAndArrivalDateFromPlacementApplication(placementApplication, reasonForPlacement, application)

    const actionItems = []

    if (placementApplication?.canBeWithdrawn && placementApplication.createdByUserId === actingUser.id) {
      actionItems.push({
        href: process.env.NEW_WITHDRAWALS_FLOW_DISABLED
          ? placementApplicationPaths.placementApplications.withdraw.new({
              id: placementApplications[0].id,
            })
          : paths.applications.withdraw.new({
              id: application.id,
            }),
        text: 'Withdraw',
      })
    }

    const rows: Array<SummaryListItem> = [
      {
        key: { text: 'Reason for placement request' },
        value: {
          text:
            placementApplication.type === 'Initial'
              ? 'Initial request for placement'
              : reasonsDictionary[reasonForPlacement] || 'None supplied',
        },
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
    ]

    if (placementApplication.isWithdrawn) {
      rows.push(withdrawnStatusTag)
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
      rows,
    }
  })
}

export const withdrawnStatusTag = {
  key: { text: 'Status' },
  value: {
    html: new ApplicationStatusTag('withdrawn').html(),
  },
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
  const options = Object.keys(ApplicationStatusTag.statuses).map(status => ({
    text: ApplicationStatusTag.statuses[status],
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

const appealDecisionRadioItems = (selectedOption: AppealDecision | undefined) => {
  const appealDecisions: Record<AppealDecision, string> = {
    accepted: 'Appeal successful',
    rejected: 'Appeal unsuccessful',
  }

  return Object.keys(appealDecisions).map(status => ({
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
  mapPlacementApplicationToSummaryCards,
  lengthOfStayForUI,
  applicationStatusSelectOptions,
  appealDecisionRadioItems,
}
