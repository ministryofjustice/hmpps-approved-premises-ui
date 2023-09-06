import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { UserClient } from '../data'

import { userFactory } from '../testutils/factories'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/userClient')

const token = 'some token'

describe('User service', () => {
  const userClient: jest.Mocked<UserClient> = new UserClient(null) as jest.Mocked<UserClient>
  const userClientFactory = jest.fn()
  const userProfile = userFactory.build({ roles: ['workflow_manager', 'assessor'] })

  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    userClientFactory.mockReturnValue(userClient)

    userService = new UserService(hmppsAuthClient, userClientFactory)

    userClient.getUserProfile.mockResolvedValue(userProfile)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getActingUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getActingUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('retrieves and populates information from the API', async () => {
      hmppsAuthClient.getActingUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getActingUser(token)

      expect(result.id).toEqual(userProfile.id)
      expect(result.roles).toEqual(['workflow_manager', 'assessor'])
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getActingUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getActingUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getUserById', () => {
    it('returns a user by ID', async () => {
      const id = 'SOME_ID'
      const user = userFactory.build()

      userClient.getActingUser.mockResolvedValue(user)

      const result = await userService.getUserById(token, id)

      expect(result).toEqual(user)

      expect(userClient.getActingUser).toHaveBeenCalledWith(id)
    })
  })

  describe('getUsers', () => {
    it('returns users by role and qualification', async () => {
      const users = userFactory.buildList(4)

      userClient.getUsers.mockResolvedValue(users)

      const result = await userService.getUsers(token, ['applicant', 'assessor'], ['pipe'])

      expect(result).toEqual(users)

      expect(userClient.getUsers).toHaveBeenCalledWith(['applicant', 'assessor'], ['pipe'])
    })
  })

  describe('updateUser', () => {
    it('calls the client method and returns the updated user', async () => {
      const user = userFactory.build()

      userClient.updateUser.mockResolvedValue(user)

      const result = await userService.updateUser(token, user)

      expect(result).toEqual(user)

      expect(userClient.updateUser).toHaveBeenCalledWith(user)
    })
  })

  describe('search', () => {
    it('calls the client method with the query and returns the result', async () => {
      const users = userFactory.buildList(1)
      const name = 'name'
      userClient.search.mockResolvedValue(users)

      const result = await userService.search(token, name)

      expect(result).toEqual(users)

      expect(userClient.search).toHaveBeenCalledWith(name)
    })
  })

  describe('deliusSearch', () => {
    it('calls the client method with the query and returns the result', async () => {
      const user = userFactory.build()
      const name = 'name'
      userClient.searchDelius.mockResolvedValue(user)

      const result = await userService.searchDelius(token, name)

      expect(result).toEqual(user)

      expect(userClient.searchDelius).toHaveBeenCalledWith(name)
    })
  })
})
