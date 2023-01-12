import type { Task, FormSections, FormSection, TableRow, PageResponse } from '@approved-premises/ui'
import type { ApprovedPremisesApplication, Document } from '@approved-premises/api'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { SessionDataError, UnknownPageError } from './errors'
import { tierBadge } from './personUtils'
import { DateFormats } from './dateUtils'
import { TasklistPageInterface } from '../form-pages/tasklistPage'

type ApplicationResponse = Record<string, Array<PageResponse>>

const taskIds = Object.keys(Apply.pages)

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

const taskIsComplete = (task: Task, application: ApprovedPremisesApplication): boolean => {
  return application.data[task.id]
}

const previousTaskIsComplete = (task: Task, application: ApprovedPremisesApplication): boolean => {
  const previousTaskId = taskIds[taskIds.indexOf(task.id) - 1]
  return previousTaskId ? application.data[previousTaskId] : true
}

const getTaskStatus = (task: Task, application: ApprovedPremisesApplication): string => {
  if (!taskIsComplete(task, application) && !previousTaskIsComplete(task, application)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Cannot start yet</strong>`
  }

  if (!taskIsComplete(task, application) && previousTaskIsComplete(task, application)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Not started</strong>`
  }

  return `<strong class="govuk-tag app-task-list__tag" id="${task.id}-status">Completed</strong>`
}

const getCompleteSectionCount = (sections: FormSections, application: ApprovedPremisesApplication): number => {
  return sections.filter((section: FormSection) => {
    return section.tasks.filter((task: Task) => taskIsComplete(task, application)).length === section.tasks.length
  }).length
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
  const Page = getPage(taskName, pageName)

  const body = application?.data?.[taskName]?.[pageName]
  const page = new Page(body, application)

  return page.response()
}

const getPage = (taskName: string, pageName: string): TasklistPageInterface => {
  const pageList = Apply.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError()
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

const documentsFromApplication = (application: ApprovedPremisesApplication): Array<Document> => {
  return (
    application?.data?.['attach-required-documents']?.['attach-documents']?.selectedDocuments || ([] as Array<Document>)
  )
}

const overwriteApplicationDocuments = (
  application: ApprovedPremisesApplication,
  selectedDocuments: Array<Document>,
): ApprovedPremisesApplication => {
  application.data['attach-required-documents'] = {
    'attach-documents': {
      selectedDocuments,
    },
  }

  return application
}

export {
  documentsFromApplication,
  getTaskStatus,
  getCompleteSectionCount,
  getResponses,
  getResponseForPage,
  getPage,
  getArrivalDate,
  dashboardTableRows,
  overwriteApplicationDocuments,
  previousTaskIsComplete,
}
