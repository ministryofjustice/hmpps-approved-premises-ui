import { TableRow } from '@approved-premises/ui'
import { format, differenceInDays, add } from 'date-fns'

import { ApprovedPremisesAssessment as Assessment, ApprovedPremisesApplication } from '@approved-premises/api'
import { tierBadge } from './personUtils'
import { DateFormats } from './dateUtils'
import { getArrivalDate } from './applicationUtils'
import paths from '../paths/assess'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import Assess from '../form-pages/assess'
import { UnknownPageError } from './errors'

const DUE_DATE_APPROACHING_DAYS_WINDOW = 3

const awaitingAssessmentTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      {
        html: assessmentLink(assessment),
      },
      {
        html: assessment.application.person.crn,
      },
      {
        html: tierBadge(assessment.application.risks.tier.value.level),
      },
      {
        text: formattedArrivalDate(assessment),
      },
      {
        text: assessment.application.person.prisonName,
      },
      {
        html: formatDaysUntilDueWithWarning(assessment),
      },
      {
        html: getStatus(assessment),
      },
    ])
  })

  return rows
}

const completedTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      {
        html: assessmentLink(assessment),
      },
      {
        html: assessment.application.person.crn,
      },
      {
        html: tierBadge(assessment.application.risks.tier.value.level),
      },
      {
        text: formattedArrivalDate(assessment),
      },
      {
        html: getStatus(assessment),
      },
    ])
  })

  return rows
}

const requestedFurtherInformationTableRows = (assessments: Array<Assessment>): Array<TableRow> => {
  const rows = [] as Array<TableRow>

  assessments.forEach(assessment => {
    rows.push([
      {
        html: assessmentLink(assessment),
      },
      {
        html: assessment.application.person.crn,
      },
      {
        html: tierBadge(assessment.application.risks.tier.value.level),
      },
      {
        text: formattedArrivalDate(assessment),
      },
      {
        text: formatDays(daysSinceReceived(assessment)),
      },
      {
        text: formatDays(daysSinceInfoRequest(assessment)),
      },
      {
        html: `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`,
      },
    ])
  })

  return rows
}

const assessmentLink = (assessment: Assessment): string => {
  return `<a href="${paths.assessments.show({ id: assessment.id })}" data-cy-assessmentId="${assessment.id}">${
    assessment.application.person.name
  }</a>`
}

const formattedArrivalDate = (assessment: Assessment): string => {
  const arrivalDate = getArrivalDate(assessment.application as ApprovedPremisesApplication)
  return format(DateFormats.isoToDateObj(arrivalDate), 'd MMM yyyy')
}

const formatDays = (days: number): string => {
  if (days === undefined) {
    return 'N/A'
  }
  return `${days} Day${days > 1 ? 's' : ''}`
}

const daysUntilDue = (assessment: Assessment): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)
  const dueDate = add(receivedDate, { days: 10 })

  return differenceInDays(dueDate, new Date())
}

const getStatus = (assessment: Assessment): string => {
  if (assessment.data) {
    if (!assessment.decision) {
      return `<strong class="govuk-tag govuk-tag--blue">In progress</strong>`
    }
    return `<strong class="govuk-tag govuk-tag">Completed</strong>`
  }
  return `<strong class="govuk-tag govuk-tag--grey">Not started</strong>`
}

const daysSinceReceived = (assessment: Assessment): number => {
  const receivedDate = DateFormats.isoToDateObj(assessment.createdAt)

  return differenceInDays(new Date(), receivedDate)
}

const formatDaysUntilDueWithWarning = (assessment: Assessment): string => {
  const days = daysUntilDue(assessment)
  if (days < DUE_DATE_APPROACHING_DAYS_WINDOW) {
    return `<strong class="assessments--index__warning">${formatDays(
      days,
    )}<span class="govuk-visually-hidden"> (Approaching due date)</span></strong>`
  }
  return formatDays(days)
}

const daysSinceInfoRequest = (assessment: Assessment): number => {
  const lastInfoRequest = assessment.clarificationNotes[assessment.clarificationNotes.length - 1]
  if (!lastInfoRequest) {
    return undefined
  }
  const infoRequestDate = DateFormats.isoToDateObj(lastInfoRequest.createdAt)

  return differenceInDays(new Date(), infoRequestDate)
}

const assessmentsApproachingDueBadge = (assessments: Array<Assessment>): string => {
  const dueCount = assessmentsApproachingDue(assessments)

  if (dueCount === 0) {
    return ''
  }
  return `<span id="notifications" class="moj-notification-badge">${dueCount}<span class="govuk-visually-hidden"> assessments approaching due date</span></span>`
}

const assessmentsApproachingDue = (assessments: Array<Assessment>): number => {
  return assessments.filter(a => daysUntilDue(a) < DUE_DATE_APPROACHING_DAYS_WINDOW).length
}

const getPage = (taskName: string, pageName: string): TasklistPageInterface => {
  const pageList = Assess.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError()
  }

  return Page as TasklistPageInterface
}

export {
  awaitingAssessmentTableRows,
  getStatus,
  getPage,
  daysSinceReceived,
  formattedArrivalDate,
  requestedFurtherInformationTableRows,
  daysSinceInfoRequest,
  formatDays,
  daysUntilDue,
  completedTableRows,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  formatDaysUntilDueWithWarning,
  assessmentLink,
}
