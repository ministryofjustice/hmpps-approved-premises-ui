import { GroupedAssessments, KeyDetailsArgs, SummaryListItem } from '@approved-premises/ui'

import {
  ApprovedPremisesAssessmentStatus,
  ApprovedPremisesAssessment as Assessment,
  ApprovedPremisesAssessmentSummary as AssessmentSummary,
  PersonAcctAlert,
} from '@approved-premises/api'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import Assess from '../../form-pages/assess'
import { UnknownPageError } from '../errors'
import Apply from '../../form-pages/apply'
import { kebabCase, linkTo } from '../utils'
import { getApplicationType } from '../applications/utils'
import { applicationAccepted, decisionFromAssessment } from './decisionUtils'
import { formattedArrivalDate } from './dateUtils'
import { getResponseForPage } from '../applications/getResponseForPage'
import { nameOrPlaceholderCopy } from '../personUtils'
import { DateFormats } from '../dateUtils'
import applyPaths from '../../paths/apply'

const awaitingAssessmentStatuses = ['in_progress', 'not_started'] as Array<ApprovedPremisesAssessmentStatus>

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
        text: getApplicationType(assessment.application),
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
  const decision = decisionFromAssessment(assessment)

  if (decision === 'accept') {
    return `<p>We've sent you a confirmation email.</p>
            <p>We've notified the Probation practitioner that this application has been assessed as suitable.</p>`
  }
  return "<p>We've notified the Probation practitioner that this application has been rejected as unsuitable for an Approved Premises.</p>"
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
  assessment.application?.data?.['prison-information']?.['case-notes']?.acctAlerts.map((acctAlert: PersonAcctAlert) => {
    return { ...acctAlert, comment: acctAlert.comment ?? '' }
  }) || []

const rejectionRationaleFromAssessmentResponses = (assessment: Assessment): string => {
  const response = getResponseForPage(assessment, 'make-a-decision', 'make-a-decision')?.Decision || ''

  if (Array.isArray(response)) return ''

  return response
}

const keyDetails = (assessment: Assessment): KeyDetailsArgs => {
  return {
    header: {
      key: 'Name',
      value: nameOrPlaceholderCopy(assessment.application.person),
      showKey: false,
    },
    items: [
      {
        key: { text: 'CRN' },
        value: { text: assessment.application.person.crn },
      },
      {
        key: { text: 'Arrival Date' },
        value: {
          text: assessment.application.arrivalDate
            ? DateFormats.isoDateToUIDate(assessment.application.arrivalDate)
            : 'Not provided',
        },
      },
      {
        value: {
          html: linkTo(
            applyPaths.applications.show,
            { id: assessment.application.id },
            { text: 'View application (opens in new window)', attributes: { target: '_blank' } },
          ),
        },
      },
    ],
  }
}

export {
  acctAlertsFromAssessment,
  adjudicationsFromAssessment,
  allocationSummary,
  caseNotesFromAssessment,
  confirmationPageMessage,
  confirmationPageResult,
  formattedArrivalDate,
  getPage,
  getReviewNavigationItems,
  groupAssessmements,
  rejectionRationaleFromAssessmentResponses,
  awaitingAssessmentStatuses,
  keyDetails,
}
