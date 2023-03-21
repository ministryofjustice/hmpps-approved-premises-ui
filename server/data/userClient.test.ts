import UserClient from './userClient'
import userFactory from '../testutils/factories/user'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('UserClient', provider => {
  let userClient: UserClient

  const token = 'token-1'

  beforeEach(() => {
    userClient = new UserClient(token)
  })

  describe('getUser', () => {
    const user = userFactory.build()
    const id = 'SOME_ID'

    it('should return a user', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a user',
        withRequest: {
          method: 'GET',
          path: paths.users.show({ id }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: user,
        },
      })

      const output = await userClient.getActingUser(id)
      expect(output).toEqual(user)
    })
  })

  describe('getUserProfile', () => {
    const user = userFactory.build()

    it('should return a user', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a user profile',
        withRequest: {
          method: 'GET',
          path: paths.users.profile({}),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: user,
        },
      })

      const output = await userClient.getUserProfile()
      expect(output).toEqual(user)
    })
  })

  describe('getUsers', () => {
    const users = userFactory.buildList(4)

    it('should return all users when no queries are specified', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
        },
      })

      const output = await userClient.getUsers()
      expect(output).toEqual(users)
    })

    it('should query by role', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with roles',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            roles: 'assessor,matcher',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
        },
      })

      const output = await userClient.getUsers(['assessor', 'matcher'])
      expect(output).toEqual(users)
    })

    it('should query by qualifications', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with qualifications',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            qualifications: 'pipe,womens',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
        },
      })

      const output = await userClient.getUsers([], ['pipe', 'womens'])
      expect(output).toEqual(users)
    })

    it('should query by qualifications and roles', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with roles and qualifications',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            roles: 'assessor,matcher',
            qualifications: 'pipe,womens',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
        },
      })

      const output = await userClient.getUsers(['assessor', 'matcher'], ['pipe', 'womens'])
      expect(output).toEqual(users)
    })
  })
})
