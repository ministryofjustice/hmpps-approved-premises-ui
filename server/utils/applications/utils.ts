import type { ApplicationType, PageResponse, TableRow } from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesApplicationSummary as ApplicationSummary,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import MaleAp from '../../form-pages/apply/reasons-for-placement/basic-information/maleAp'
import IsExceptionalCase from '../../form-pages/apply/reasons-for-placement/basic-information/isExceptionalCase'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import { UnknownPageError } from '../errors'
import { isApplicableTier, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import Assess from '../../form-pages/assess'
import isAssessment from '../assessments/isAssessment'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'
import { retrieveOptionalQuestionResponseFromApplicationOrAssessment } from '../retrieveQuestionResponseFromApplicationOrAssessment'
import ExceptionDetails from '../../form-pages/apply/reasons-for-placement/basic-information/exceptionDetails'

const dashboardTableRows = (applications: Array<ApplicationSummary>): Array<TableRow> => {
  return applications.map(application => {
    const tier = application.risks?.tier?.value?.level

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      htmlValue(tier == null ? '' : tierBadge(tier)),
      textValue(
        application.arrivalDate ? DateFormats.isoDateToUIDate(application.arrivalDate, { format: 'short' }) : 'N/A',
      ),
      htmlValue(getStatus(application)),
    ]
  })
}

const getStatus = (application: ApplicationSummary): string => {
  switch (application.status) {
    case 'submitted':
      return `<strong class="govuk-tag">Submitted</strong>`
    case 'requestedFurtherInformation':
      return `<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>`
    default:
      return `<strong class="govuk-tag govuk-tag--blue">In Progress</strong>`
  }
}

const textValue = (value: string) => {
  return { text: value }
}

const htmlValue = (value: string) => {
  return { html: value }
}

const createNameAnchorElement = (name: string, applicationId: string) => {
  return htmlValue(
    `<a href=${paths.applications.show({ id: applicationId })} data-cy-id="${applicationId}">${name}</a>`,
  )
}

export type ApplicationOrAssessmentResponse = Record<string, Array<PageResponse>>

const getResponses = (applicationOrAssessment: Application | Assessment): ApplicationOrAssessmentResponse => {
  const responses = {}

  Object.keys(applicationOrAssessment.data).forEach(taskName => {
    responses[taskName] = getResponsesForTask(applicationOrAssessment, taskName)
  })

  return responses
}

const getResponsesForTask = (
  applicationOrAssessment: Application | Assessment,
  taskName: string,
): Array<PageResponse> => {
  const pageNames = Object.keys(applicationOrAssessment.data[taskName])
  const responsesForPages = pageNames.map(pageName => getResponseForPage(applicationOrAssessment, taskName, pageName))
  return responsesForPages
}

const getResponseForPage = (
  applicationOrAssessment: Application | Assessment,
  taskName: string,
  pageName: string,
): PageResponse => {
  const Page = getPage(taskName, pageName, isAssessment(applicationOrAssessment))

  const body = applicationOrAssessment?.data?.[taskName]?.[pageName]
  const page = new Page(body, applicationOrAssessment)

  return page.response()
}

const getPage = (taskName: string, pageName: string, isAnAssessment?: boolean): TasklistPageInterface => {
  const pageList = isAnAssessment ? Assess.pages[taskName] : Apply.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError(pageName)
  }

  return Page as TasklistPageInterface
}

const isInapplicable = (application: Application): boolean => {
  const isExceptionalCase = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    application,
    IsExceptionalCase,
    'isExceptionalCase',
  )

  const agreedCaseWithManager = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
    application,
    ExceptionDetails,
    'agreedCaseWithManager',
  )

  const shouldPersonBePlacedInMaleAp = retrieveOptionalQuestionResponseFromApplicationOrAssessment(
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
  if (isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'transgender' })
  }

  return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
}

const getApplicationType = (application: Application): ApplicationType => {
  if (application.isPipeApplication) {
    return 'PIPE'
  }
  return 'Standard'
}

export {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  arrivalDateFromApplication,
  getApplicationType,
  getPage,
  getResponseForPage,
  getResponses,
  getStatus,
  isInapplicable,
}
