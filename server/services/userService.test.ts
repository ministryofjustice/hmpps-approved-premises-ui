import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { UserClient } from '../data'

import userFactory from '../testutils/factories/user'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/userClient')

const token = 'some token'

describe('User service', () => {
  const userClient: jest.Mocked<UserClient> = new UserClient(null) as jest.Mocked<UserClient>
  const userClientFactory = jest.fn()

  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    userClientFactory.mockReturnValue(userClient)

    userService = new UserService(hmppsAuthClient, userClientFactory)
  })

  describe('getUser', () => {
    it('Retrieves and formats user name', async () => {
      hmppsAuthClient.getUser.mockResolvedValue({ name: 'john smith' } as User)

      const result = await userService.getUser(token)

      expect(result.displayName).toEqual('John Smith')
    })

    it('Propagates error', async () => {
      hmppsAuthClient.getUser.mockRejectedValue(new Error('some error'))

      await expect(userService.getUser(token)).rejects.toEqual(new Error('some error'))
    })
  })

  describe('getUserById', () => {
    it('returns a user by ID', async () => {
      const id = 'SOME_ID'
      const user = userFactory.build()

      userClient.getUser.mockResolvedValue(user)

      const result = await userService.getUserById(token, id)

      expect(result).toEqual(user)

      expect(userClient.getUser).toHaveBeenCalledWith(id)
    })
  })
})
