import type { ApplicationType, PageResponse, TableRow } from '@approved-premises/ui'
import type {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'
import paths from '../../paths/apply'
import Apply from '../../form-pages/apply'
import { UnknownPageError } from '../errors'
import { isApplicableTier, tierBadge } from '../personUtils'
import { DateFormats } from '../dateUtils'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'
import Assess from '../../form-pages/assess'
import isAssessment from '../assessments/isAssessment'
import { arrivalDateFromApplication } from './arrivalDateFromApplication'

const dashboardTableRows = (applications: Array<Application>): Array<TableRow> => {
  return applications.map(application => {
    const arrivalDate = arrivalDateFromApplication(application, false)
    const tier = application.risks?.tier?.value?.level

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      htmlValue(tier == null ? '' : tierBadge(tier)),
      textValue(arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'),
      htmlValue(getStatus(application)),
    ]
  })
}

const getStatus = (application: Application): string => {
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
  return htmlValue(`<a href=${paths.applications.show({ id: applicationId })}>${name}</a>`)
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

const isUnapplicable = (application: Application): boolean => {
  const basicInformation = application.data?.['basic-information']
  const isExceptionalCase = basicInformation?.['is-exceptional-case']?.isExceptionalCase

  return isExceptionalCase === 'no'
}

const firstPageOfApplicationJourney = (application: Application) => {
  if (isApplicableTier(application.person.sex, application.risks?.tier?.value?.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' })
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
  isUnapplicable,
}
