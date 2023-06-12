import { ApplicationType, GroupedAssessments, SummaryListItem } from '@approved-premises/ui'

import { ApprovedPremisesAssessment as Assessment, AssessmentSummary } from '@approved-premises/api'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import Apply from '../../form-pages/apply'
import { kebabCase } from '../utils'
import { getApplicationType as getApplicationTypeFromApplication, getResponseForPage } from '../applications/utils'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { assessmentsApproachingDue, formattedArrivalDate } from './dateUtils'
import { awaitingAssessmentTableRows, completedTableRows, requestedFurtherInformationTableRows } from './tableUtils'

const groupAssessmements = (assessments: Array<AssessmentSummary>): GroupedAssessments => {
  const result = { completed: [], requestedFurtherInformation: [], awaiting: [] } as GroupedAssessments

  assessments.forEach(assessment => {
    switch (assessment.status) {
      case 'completed':
        result.completed.push(assessment)
        break
      case 'awaiting_response':
        result.requestedFurtherInformation.push(assessment)
        break
      default:
        result.awaiting.push(assessment)
        break
    }
  })

  return result
}

const getApplicationType = (assessment: Assessment): ApplicationType => {
  return getApplicationTypeFromApplication(assessment.application)
}

const allocationSummary = (assessment: Assessment): Array<SummaryListItem> => {
  const summary = [
    {
      key: {
        text: 'CRN',
      },
      value: {
        text: assessment.application.person.crn,
      },
    },
    {
      key: {
        text: 'Arrival date',
      },
      value: {
        text: formattedArrivalDate(assessment),
      },
    },
    {
      key: {
        text: 'Application Type',
      },
      value: {
        text: getApplicationType(assessment),
      },
    },
  ]

  if (assessment.allocatedToStaffMember) {
    summary.push({
      key: {
        text: 'Allocated To',
      },
      value: {
        text: assessment.allocatedToStaffMember.name,
      },
    })
  }

  return summary
}

const assessmentsApproachingDueBadge = (assessments: Array<AssessmentSummary>): string => {
  const dueCount = assessmentsApproachingDue(assessments)

  if (dueCount === 0) {
    return ''
  }
  return `<span id="notifications" class="moj-notification-badge">${dueCount}<span class="govuk-visually-hidden"> assessments approaching due date</span></span>`
}

const getPage = (taskName: string, pageName: string): TasklistPageInterface => {
  const pageList = Assess.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

const getReviewNavigationItems = () => {
  const applySections = Apply.sections.slice(0, -1)
  return applySections.map(applicationSection => {
    return {
      href: `#${kebabCase(applicationSection.title)}`,
      text: applicationSection.title,
    }
  })
}

const confirmationPageMessage = (assessment: Assessment) => {
  switch (decisionFromAssessment(assessment)) {
    case 'releaseDate':
      return "<p>We've notified the Probation practitioner that this application has been assessed as suitable.</p>"
    case 'hold':
      return `<p>We've notified the Probation practitioner that this application has been assessed as suitable.</p>
      <p>This case is now paused until the oral hearing outcome has been provided by the Probation practitioner and a release date is confirmed.</p>
      <p>It will be added to the matching queue if the oral hearing is successful.</p>`
    default:
      return `<p>We've sent you a confirmation email.</p>
      <p>We've notified the Probation practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>`
  }
}

const confirmationPageResult = (assessment: Assessment) => {
  switch (applicationAccepted(assessment)) {
    case true:
      return 'You have marked this application as suitable.'
    default:
      return 'You have marked this application as unsuitable.'
  }
}

const adjudicationsFromAssessment = (assessment: Assessment) =>
  assessment.application?.data?.['prison-information']?.['case-notes']?.adjudications || []

const caseNotesFromAssessment = (assessment: Assessment) =>
  assessment.application?.data?.['prison-information']?.['case-notes']?.selectedCaseNotes || []

const acctAlertsFromAssessment = (assessment: Assessment) =>
  assessment.application?.data?.['prison-information']?.['case-notes']?.acctAlerts || []

const rejectionRationaleFromAssessmentResponses = (assessment: Assessment): string => {
  const response = getResponseForPage(assessment, 'make-a-decision', 'make-a-decision')?.Decision || ''

  if (Array.isArray(response)) return ''

  return response
}

export {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  allocationSummary,
  assessmentsApproachingDue,
  assessmentsApproachingDueBadge,
  caseNotesFromAssessment,
  confirmationPageMessage,
  confirmationPageResult,
  formattedArrivalDate,
  getApplicationType,
  getPage,
  getReviewNavigationItems,
  groupAssessmements,
  rejectionRationaleFromAssessmentResponses,
  awaitingAssessmentTableRows,
  completedTableRows,
  requestedFurtherInformationTableRows,
}
