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

      const output = await userClient.getActingUser(id)
      expect(output).toEqual(user)
    })
  })

  describe('getUserProfile', () => {
    const user = userFactory.build()

    it('should return a user', async () => {
      fakeApprovedPremisesApi
        .get(paths.users.profile({}))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, user)

      const output = await userClient.getUserProfile()
      expect(output).toEqual(user)
    })
  })

  describe('getUsers', () => {
    const users = userFactory.buildList(4)

    it('should return all users when no queries are specified', async () => {
      fakeApprovedPremisesApi
        .get(paths.users.index({}))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, users)

      const output = await userClient.getUsers()
      expect(output).toEqual(users)
    })

    it('should query by role', async () => {
      fakeApprovedPremisesApi
        .get(`${paths.users.index({})}?roles=assessor,matcher`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, users)

      const output = await userClient.getUsers(['assessor', 'matcher'])
      expect(output).toEqual(users)
    })

    it('should query by qualifications', async () => {
      fakeApprovedPremisesApi
        .get(`${paths.users.index({})}?qualifications=pipe,womens`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, users)

      const output = await userClient.getUsers([], ['pipe', 'womens'])
      expect(output).toEqual(users)
    })

    it('should query by qualifications and roles', async () => {
      fakeApprovedPremisesApi
        .get(`${paths.users.index({})}?roles=assessor,matcher&qualifications=pipe,womens`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, users)

      const output = await userClient.getUsers(['assessor', 'matcher'], ['pipe', 'womens'])
      expect(output).toEqual(users)
    })
  })
})
