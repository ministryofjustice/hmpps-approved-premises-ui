import nock from 'nock'

import TaskClient from './taskClient'
import config from '../config'
import paths from '../paths/api'

import taskFactory from '../testutils/factories/task'

describe('taskClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let taskClient: TaskClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    config.flags.oasysDisabled = false
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    taskClient = new TaskClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  it('makes a get request to the tasks endpoint', async () => {
    const tasks = taskFactory.buildList(2)

    fakeApprovedPremisesApi
      .get(paths.tasks.index.pattern)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, tasks)

    const result = await taskClient.all()

    expect(result).toEqual(tasks)
    expect(nock.isDone()).toBeTruthy()
  })
})
