import { SuperAgentRequest } from 'superagent'
import { ApprovedPremisesApplication } from '@approved-premises/api'

import { bulkStub } from '../../wiremock'

const generateStubsForPage = (
  page: string,
  pageIndex: number,
  task: string,
  pages: Array<string>,
  previousTask: string,
  application: ApprovedPremisesApplication,
  data: Record<string, unknown>,
) => {
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
    requiredScenarioState = 'applicationStarted'
  }

  if (nextPage) {
    newScenarioState = `${task}${page}PageUpdated`
  } else {
    newScenarioState = `${task}TaskUpdated`
  }

  data[task] = {}

  completePages.forEach(completePage => {
    data[task][completePage] = application.data[task][completePage]
  })

  const pageResponse = cloneApplicationWithData({ application, data })

  const getPageStub = {
    scenarioName: 'apply',
    requiredScenarioState,
    request: {
      method: 'GET',
      url: `/applications/${application.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: pageResponse,
    },
  }

  const updatePageStub = {
    scenarioName: 'apply',
    requiredScenarioState,
    newScenarioState,
    request: {
      method: 'PUT',
      url: `/applications/${application.id}`,
    },
    response: {
      status: 201,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: `
            {
              "id": "{{request.pathSegments.[1]}}",
              "person": ${JSON.stringify(application.person)},
              "createdByProbationOfficerId": "${application.createdByUserId}",
              "schemaVersion": "${application.schemaVersion}",
              "createdAt": "${application.createdAt}",
              "submittedAt": "${application.submittedAt}",
              "data": "${data}"
            }
            `,
      transformers: ['response-template'],
    },
  }

  return [getPageStub, updatePageStub]
}

const generateTaskListStubForTask = (
  application: ApprovedPremisesApplication,
  task: string,
  nextTask: string,
  data: Record<string, unknown>,
) => {
  const tasklistResponse = cloneApplicationWithData({ application, data })

  return {
    scenarioName: 'apply',
    requiredScenarioState: `${task}TaskUpdated`,
    newScenarioState: nextTask ? `${nextTask}TaskStarted` : `applicationComplete`,
    request: {
      method: 'GET',
      url: `/applications/${application.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: tasklistResponse,
    },
  }
}

const cloneApplicationWithData = ({ application, data }) => {
  return JSON.parse(JSON.stringify({ ...application, data }))
}

const copyCompleteTasksToData = ({ completeTasks, application }) => {
  const data = {}
  completeTasks.forEach(completeTask => {
    data[completeTask] = application.data[completeTask]
  })

  return data
}

export const stubApplicationJourney = (application: ApprovedPremisesApplication): SuperAgentRequest => {
  const scenarioName = 'apply'

  const stubs = [
    {
      scenarioName,
      requiredScenarioState: 'Started',
      newScenarioState: 'applicationCreated',
      request: {
        method: 'POST',
        url: `/applications?createWithRisks=true`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...application, data: null },
      },
    },
    {
      scenarioName,
      requiredScenarioState: 'applicationCreated',
      newScenarioState: 'applicationStarted',
      request: {
        method: 'GET',
        url: `/applications/${application.id}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...application, data: {} },
      },
    },
  ] as Array<Record<string, unknown>>

  const tasks = Object.keys(application.data)

  tasks.forEach((task, taskIndex) => {
    const previousTask = taskIndex > 0 ? tasks[taskIndex - 1] : undefined
    const nextTask = tasks[taskIndex + 1]
    const completeTasks = tasks.slice(0, taskIndex + 1)

    const data = { ...copyCompleteTasksToData({ completeTasks, application }) }

    stubs.push(generateTaskListStubForTask(application, task, nextTask, data))

    const pages = Object.keys(application.data[task])

    pages.forEach((page, pageIndex) => {
      stubs.push(...generateStubsForPage(page, pageIndex, task, pages, previousTask, application, data))
    })
  })

  const journeyEndStub = {
    scenarioName: 'apply',
    requiredScenarioState: `applicationComplete`,
    request: {
      method: 'GET',
      url: `/applications/${application.id}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: application,
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
