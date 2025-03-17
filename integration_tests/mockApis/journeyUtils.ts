import { SuperAgentRequest } from 'superagent'
import {
  ApprovedPremisesApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '@approved-premises/api'

import { bulkStub, getMatchingRequests } from './setup'
import isAssessment from '../../server/utils/assessments/isAssessment'

export const generateStubsForPage = (
  page: string,
  pageIndex: number,
  task: string,
  pages: Array<string>,
  previousTask: string,
  form: Application | Assessment,
  data: Record<string, unknown>,
) => {
  const pageType = isAssessment(form) ? 'assessment' : 'application'

  const previousPage = pageIndex > 0 ? pages[pageIndex - 1] : undefined
  const nextPage = pages[pageIndex + 1]

  const completePages = pages.slice(0, pageIndex)

  let requiredScenarioState: string
  let newScenarioState: string

  if (previousPage) {
    requiredScenarioState = `${task}${previousPage}PageUpdated`
  } else if (previousTask) {
    requiredScenarioState = `${task}TaskStarted`
  } else {
    requiredScenarioState = `${pageType}Started`
  }

  if (nextPage) {
    newScenarioState = `${task}${page}PageUpdated`
  } else {
    newScenarioState = `${task}TaskUpdated`
  }

  data[task] = {}

  completePages.forEach(completePage => {
    data[task][completePage] = form.data[task][completePage]
  })

  if (page === 'information-received') {
    form.status = 'awaiting_response'
  }

  const pageResponse = cloneApplicationWithData({ form, data })

  const scenarioName = pageType === 'application' ? 'apply' : 'assess'
  const url = `/${pageType}s`

  const getPageStub = {
    scenarioName,
    requiredScenarioState,
    request: {
      method: 'GET',
      url: `${url}/${form.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: pageResponse,
    },
  }

  const updatePageStub = {
    scenarioName,
    requiredScenarioState,
    newScenarioState,
    request: {
      method: 'PUT',
      url: `${url}/${form.id}`,
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: stubRequestBody(form, data),
      transformers: ['response-template'],
    },
  }

  return [getPageStub, updatePageStub]
}

const stubRequestBody = (form: Application | Assessment, formData: Record<string, unknown>): string => {
  if (!isAssessment(form)) {
    return `
      {
        "id": "{{request.pathSegments.[1]}}",
        "person": ${JSON.stringify(form.person)},
        "createdByProbationOfficerId": "${form.createdByUserId}",
        "createdAt": "${form.createdAt}",
        "submittedAt": "${form.submittedAt}",
        "data": "${formData}"
      }
      `
  }

  return `
    {
      "id": "{{request.pathSegments.[1]}}",
      "createdAt": "${form.createdAt}",
      "submittedAt": "${form.submittedAt}",
      "application": "${form.application}",
      "data": "${formData}"
    }
    `
}

export const generateTaskListStubForTask = (
  form: Application | Assessment,
  task: string,
  nextTask: string,
  data: Record<string, unknown>,
) => {
  const applicationOrAssessment = isAssessment(form) ? 'assessment' : 'application'

  const tasklistResponse = cloneApplicationWithData({ form, data })

  return {
    scenarioName: applicationOrAssessment === 'application' ? 'apply' : 'assess',
    requiredScenarioState: `${task}TaskUpdated`,
    newScenarioState: nextTask ? `${nextTask}TaskStarted` : `${applicationOrAssessment}Complete`,
    request: {
      method: 'GET',
      url: `/${applicationOrAssessment}s/${form.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: tasklistResponse,
    },
  }
}

export const cloneApplicationWithData = ({ form, data }) => {
  return JSON.parse(JSON.stringify({ ...form, data }))
}

export const copyCompleteTasksToData = ({ completeTasks, form }) => {
  const data = {}
  completeTasks.forEach(completeTask => {
    data[completeTask] = form.data[completeTask]
  })

  return data
}

export const verifyApiRequest = async (
  url: string,
  method: 'POST' | 'PATCH' | 'PUT',
): Promise<Record<string, unknown>> => {
  const result = await getMatchingRequests({
    method,
    url,
  })
  const { requests } = result.body
  return JSON.parse(requests[0].body)
}

export const verifyApiPost = (url: string) => verifyApiRequest(url, 'POST')
export const verifyApiPatch = (url: string) => verifyApiRequest(url, 'PATCH')
export const verifyApiPut = (url: string) => verifyApiRequest(url, 'PUT')

export const stubJourney = (form: Application | Assessment): SuperAgentRequest => {
  type JourneyType =
    | { scenarioName: 'assess'; urlPrefix: 'assessment' }
    | { scenarioName: 'apply'; urlPrefix: 'application' }
  const journeyType: JourneyType = isAssessment(form)
    ? { scenarioName: 'assess', urlPrefix: 'assessment' }
    : { scenarioName: 'apply', urlPrefix: 'application' }

  const { scenarioName } = journeyType
  const journeyName = journeyType.urlPrefix

  const request =
    journeyType.scenarioName === 'apply'
      ? {
          method: 'POST',
          url: `/applications?createWithRisks=true`,
        }
      : {
          method: 'GET',
          url: `/assessments/${form.id}`,
        }

  const stubs = [
    {
      scenarioName,
      requiredScenarioState: `Started`,
      newScenarioState: `${journeyName}Created`,
      request,
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...form, data: null },
      },
    },
    {
      scenarioName,
      requiredScenarioState: `${journeyName}Created`,
      newScenarioState: `${journeyName}Started`,
      request: {
        method: 'GET',
        url: `/${journeyName}s/${form.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...form, data: {} },
      },
    },
  ] as Array<Record<string, unknown>>

  const tasks = Object.keys(form.data)

  tasks.forEach((task, taskIndex) => {
    const previousTask = taskIndex > 0 ? tasks[taskIndex - 1] : undefined
    const nextTask = tasks[taskIndex + 1]
    const completeTasks = tasks.slice(0, taskIndex + 1)

    const data = { ...copyCompleteTasksToData({ completeTasks, form }) }

    stubs.push(generateTaskListStubForTask(form, task, nextTask, data))

    const pages = Object.keys(form.data[task])

    pages.forEach((page, pageIndex) => {
      stubs.push(...generateStubsForPage(page, pageIndex, task, pages, previousTask, form, data))
    })
  })

  const journeyEndStub = {
    scenarioName: journeyType.scenarioName,
    requiredScenarioState: `${journeyType.urlPrefix}Complete`,
    request: {
      method: 'GET',
      url: `/${journeyType.urlPrefix}s/${form.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: form,
    },
  }

  stubs.push(journeyEndStub)

  return bulkStub({
    mappings: stubs,
    importOptions: {
      duplicatePolicy: 'IGNORE',
      deleteAllNotInImport: false,
    },
  })
}
