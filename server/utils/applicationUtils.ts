import type { TableRow, PageResponse } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { SessionDataError, UnknownPageError } from './errors'
import { isApplicableTier, tierBadge } from './personUtils'
import { DateFormats } from './dateUtils'
import { TasklistPageInterface } from '../form-pages/tasklistPage'
import Assess from '../form-pages/assess'
import isAssessment from './assessments/isAssessment'

type ApplicationResponse = Record<string, Array<PageResponse>>

const dashboardTableRows = (applications: Array<ApprovedPremisesApplication>): Array<TableRow> => {
  return applications.map(application => {
    const arrivalDate = getArrivalDate(application, false)

    return [
      createNameAnchorElement(application.person.name, application.id),
      textValue(application.person.crn),
      htmlValue(tierBadge(application.risks.tier.value?.level || '')),
      textValue(arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'N/A'),
      textValue(
        application.submittedAt ? DateFormats.isoDateToUIDate(application.submittedAt, { format: 'short' }) : 'N/A',
      ),
    ]
  })
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

const getResponses = (application: ApprovedPremisesApplication): ApplicationResponse => {
  const responses = {}

  Object.keys(application.data).forEach(taskName => {
    responses[taskName] = getResponsesForTask(application, taskName)
  })

  return responses
}

const getResponsesForTask = (application: ApprovedPremisesApplication, taskName: string): Array<PageResponse> => {
  const pageNames = Object.keys(application.data[taskName])
  const responsesForPages = pageNames.map(pageName => getResponseForPage(application, taskName, pageName))
  return responsesForPages
}

const getResponseForPage = (
  application: ApprovedPremisesApplication,
  taskName: string,
  pageName: string,
): PageResponse => {
  const Page = getPage(taskName, pageName, isAssessment(application))

  const body = application?.data?.[taskName]?.[pageName]
  const page = new Page(body, application)

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

const getArrivalDate = (application: ApprovedPremisesApplication, raiseOnMissing = true): string | null => {
  const throwOrReturnNull = (message: string): null => {
    if (raiseOnMissing) {
      throw new SessionDataError(message)
    }

    return null
  }

  const basicInformation = application.data?.['basic-information']

  if (!basicInformation) return throwOrReturnNull('No basic information')

  const {
    knowReleaseDate = '',
    startDateSameAsReleaseDate = '',
    releaseDate = '',
    startDate = '',
  } = {
    ...basicInformation['release-date'],
    ...basicInformation['placement-date'],
  }

  if (!knowReleaseDate || knowReleaseDate === 'no') {
    return throwOrReturnNull('No known release date')
  }

  if (knowReleaseDate === 'yes' && startDateSameAsReleaseDate === 'yes') {
    if (!releaseDate) {
      return throwOrReturnNull('No release date')
    }

    return releaseDate
  }

  if (startDateSameAsReleaseDate === 'no') {
    if (!startDate) {
      return throwOrReturnNull('No start date')
    }

    return startDate
  }

  return null
}

const firstPageOfApplicationJourney = (application: ApprovedPremisesApplication) => {
  if (isApplicableTier(application.person.sex, application.risks.tier.value.level)) {
    return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' })
  }

  return paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' })
}

export { getResponses, getResponseForPage, getPage, getArrivalDate, dashboardTableRows, firstPageOfApplicationJourney }
