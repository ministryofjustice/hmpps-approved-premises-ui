import type { Task, FormSections, FormSection } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'
import paths from '../paths/apply'
import { pages } from '../form-pages/apply'
import { UnknownPageError } from './errors'

type PageResponse = Record<string, string>
type ApplicationResponse = Record<string, Array<PageResponse>>

const taskIds = Object.keys(pages)

const taskIsComplete = (task: Task, application: Application): boolean => {
  return application.data[task.id]
}

const previousTaskIsComplete = (task: Task, application: Application): boolean => {
  const previousTaskId = taskIds[taskIds.indexOf(task.id) - 1]
  return previousTaskId ? application.data[previousTaskId] : true
}

const getTaskStatus = (task: Task, application: Application): string => {
  if (!taskIsComplete(task, application) && !previousTaskIsComplete(task, application)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Cannot start yet</strong>`
  }

  if (!taskIsComplete(task, application) && previousTaskIsComplete(task, application)) {
    return `<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="${task.id}-status">Not started</strong>`
  }

  return `<strong class="govuk-tag app-task-list__tag" id="${task.id}-status">Completed</strong>`
}

const getCompleteSectionCount = (sections: FormSections, application: Application): number => {
  return sections.filter((section: FormSection) => {
    return section.tasks.filter((task: Task) => taskIsComplete(task, application)).length === section.tasks.length
  }).length
}

const taskLink = (task: Task, application: Application): string => {
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

const getResponses = (application: Application): ApplicationResponse => {
  const responses = {}

  Object.keys(application.data).forEach(taskName => {
    responses[taskName] = getResponsesForTask(application, taskName)
  })

  return responses
}

const getResponsesForTask = (application: Application, taskName: string): Array<PageResponse> => {
  const pageNames = Object.keys(application.data[taskName])
  const responsesForPages = pageNames.map(pageName => getResponseForPage(application, taskName, pageName))
  return responsesForPages
}

const getResponseForPage = (application: Application, taskName: string, pageName: string): PageResponse => {
  const Page = getPage(taskName, pageName)

  const body = application?.data?.[taskName]?.[pageName]
  const page = new Page(body, application)

  return page.response()
}

const getPage = (taskName: string, pageName: string) => {
  const pageList = pages[taskName]

  const Page = pageList[pageName]

  if (!Page) {
    throw new UnknownPageError()
  }

  return Page
}

export { getTaskStatus, taskLink, getCompleteSectionCount, getResponses, getResponseForPage, getPage }
