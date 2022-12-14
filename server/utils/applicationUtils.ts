import type { Task, FormSections, FormSection } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import { SessionDataError, UnknownPageError } from './errors'

type PageResponse = Record<string, string | Array<Record<string, unknown>>>
type ApplicationResponse = Record<string, Array<PageResponse>>

const taskIds = Object.keys(Apply.pages)

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

const taskLink = (task: Task, application: ApprovedPremisesApplication): string => {
  if (previousTaskIsComplete(task, application)) {
    const firstPage = Object.keys(task.pages)[0]

    return `<a href="${paths.applications.pages.show({
      id: application.id,
      task: task.id,
      page: firstPage,
    })}" aria-describedby="eligibility-${task.id}" data-cy-task-name="${task.id}">${task.title}</a>`
  }
  return task.title
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

const getPage = (taskName: string, pageName: string) => {
  const pageList = Apply.pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError()
  }

  return Page
}

const getArrivalDate = (application: ApprovedPremisesApplication): string | null => {
  const basicInformation = application.data['basic-information']

  if (!basicInformation) throw new SessionDataError('No basic information')

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
    throw new SessionDataError('No known release date')
  }

  if (knowReleaseDate === 'yes' && startDateSameAsReleaseDate === 'yes') {
    if (!releaseDate) {
      throw new SessionDataError('No release date')
    }

    return releaseDate
  }

  if (startDateSameAsReleaseDate === 'no') {
    if (!startDate) {
      throw new SessionDataError('No start date')
    }

    return startDate
  }

  return null
}

export { getTaskStatus, taskLink, getCompleteSectionCount, getResponses, getResponseForPage, getPage, getArrivalDate }
