import superagent from 'superagent'
import nock from 'nock'
import { faker } from '@faker-js/faker'
import { userVersionMiddleware } from './userVersionMiddleware'
import inMemoryStore from '../inMemoryStore'

describe('userVersionMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
    inMemoryStore.users = {}
  })

  it('stores the user version in memory to compare it with session later', async () => {
    const userId = faker.string.uuid()
    const userVersion = faker.string.alphanumeric(8)
    const fakeApi = nock('https://httpbin.org/')
    fakeApi.get('/', '').reply(200, {}, { 'x-cas-user-id': userId, 'x-cas-user-version': userVersion })

    await superagent.get('https://httpbin.org/').use(userVersionMiddleware).set('accept', 'json')

    expect(inMemoryStore.users[userId]).toEqual(userVersion)
    nock.cleanAll()
  })

  it('ignores responses without the user version headers', async () => {
    const fakeApi = nock('https://httpbin.org/')
    fakeApi.get('/', '').reply(200, {})

    await superagent.get('https://httpbin.org/').use(userVersionMiddleware).set('accept', 'json')

    expect(inMemoryStore.users).toEqual({})
    nock.cleanAll()
  })
})
