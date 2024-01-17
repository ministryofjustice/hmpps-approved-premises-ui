import UserClient from './userClient'
import { userFactory } from '../testutils/factories'
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
            roles: 'assessor,matcher',
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

      const output = await userClient.getUsers('', ['assessor', 'matcher'])

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
            qualifications: 'pipe,womens',
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

      const output = await userClient.getUsers('', [], ['pipe', 'womens'])

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
            roles: 'assessor,matcher',
            qualifications: 'pipe,womens',
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

      const output = await userClient.getUsers('', ['assessor', 'matcher'], ['pipe', 'womens'])

      expect(output).toEqual({
        data: users,
        pageNumber: '1',
        totalPages: '10',
        totalResults: '100',
        pageSize: '10',
      })
    })
  })

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = userFactory.build()

      const rolesAndQualifications = { roles: user.roles, qualifications: user.qualifications }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a user',
        withRequest: {
          method: 'PUT',
          path: paths.users.update({ id: user.id }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
          body: rolesAndQualifications,
        },
        willRespondWith: {
          status: 200,
          body: user,
        },
      })

      const output = await userClient.updateUser(user.id, rolesAndQualifications)
      expect(output).toEqual(user)
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

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = userFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to delete a user',
        withRequest: {
          method: 'DELETE',
          path: paths.users.delete({ id: user.id }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await userClient.delete(user.id)
    })
  })
})
