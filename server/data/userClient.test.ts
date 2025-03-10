import UserClient from './userClient'
import { userFactory, userSummaryFactory } from '../testutils/factories'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('UserClient', provider => {
  let userClient: UserClient

  const token = 'token-1'

  beforeEach(() => {
    userClient = new UserClient(token)
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

  describe('getUserList', () => {
    const users = userSummaryFactory.buildList(4)

    it('should return all users without pagination', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of all users without pagination',
        withRequest: {
          method: 'GET',
          path: paths.users.summary({}),
          query: {
            roles: '',
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

      const output = await userClient.getUserList()

      expect(output).toEqual(users)
    })

    it('should return all users with a given role without pagination', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of all users without pagination',
        withRequest: {
          method: 'GET',
          path: paths.users.summary({}),
          query: {
            roles: 'applicant,assessor',
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

      const output = await userClient.getUserList(['applicant', 'assessor'])

      expect(output).toEqual(users)
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
          query: {
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers()

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should return all users when a specific page number specified', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            page: '2',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers('', [], [], 2)

      expect(output).toEqual({
        data: users,
        pageNumber: '2',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should return all users when a specific sort direction specified', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers('', [], [], 1, 'name', 'asc')

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should query by role', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with roles',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            roles: 'assessor,appeals_manager',
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers('', ['assessor', 'appeals_manager'])

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should query by qualifications', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with qualifications',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            qualifications: 'pipe,emergency',
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers('', [], ['pipe', 'emergency'])

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })

    it('should query by qualifications and roles', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of users with roles and qualifications',
        withRequest: {
          method: 'GET',
          path: paths.users.index({}),
          query: {
            roles: 'assessor,appeals_manager',
            qualifications: 'pipe,emergency',
            page: '1',
            sortBy: 'name',
            sortDirection: 'asc',
          },
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
          body: users,
          headers: {
            'X-Pagination-TotalPages': '10',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '10',
          },
        },
      })

      const output = await userClient.getUsers('', ['assessor', 'appeals_manager'], ['pipe', 'emergency'])

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })
  })

  describe('search', () => {
    it('should search for a user', async () => {
      const users = userFactory.buildList(1)
      const name = 'name'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to search for a user',
        withRequest: {
          method: 'GET',
          path: paths.users.search({}),
          query: {
            name,
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

      const output = await userClient.search(name)
      expect(output).toEqual(users)
    })
  })

  describe('searchDelius', () => {
    it('should search for a user in delius', async () => {
      const user = userFactory.build()
      const name = 'name'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to search for a user in delius',
        withRequest: {
          method: 'GET',
          path: paths.users.searchDelius({}),
          query: {
            name,
          },
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

      const output = await userClient.searchDelius(name)
      expect(output).toEqual(user)
    })
  })
})
