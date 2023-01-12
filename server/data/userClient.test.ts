import nock from 'nock'

import UserClient from './userClient'
import userFactory from '../testutils/factories/user'
import config from '../config'
import paths from '../paths/api'

describe('UserClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let userClient: UserClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    userClient = new UserClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('getUser', () => {
    const user = userFactory.build()
    const id = 'SOME_ID'

    it('should return a user', async () => {
      fakeApprovedPremisesApi
        .get(paths.users.show({ id }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, user)

      const output = await userClient.getUser(id)
      expect(output).toEqual(user)
    })
  })
})
