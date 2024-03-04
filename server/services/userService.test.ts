import UserService from './userService'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { UserClient } from '../data'

import { paginatedResponseFactory, referenceDataFactory, userFactory } from '../testutils/factories'
import { PaginatedResponse } from '../@types/ui'
import { ApprovedPremisesUser } from '../@types/shared'
import ReferenceDataClient from '../data/referenceDataClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/userClient')
jest.mock('../data/referenceDataClient.ts')

const token = 'some token'

describe('User service', () => {
  const userClient: jest.Mocked<UserClient> = new UserClient(null) as jest.Mocked<UserClient>
  const userClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()
  const userProfile = userFactory.build({ roles: ['workflow_manager', 'assessor'] })
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  let hmppsAuthClient: jest.Mocked<HmppsAuthClient>
  let userService: UserService

  beforeEach(() => {
    jest.resetAllMocks()

    hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
    userClientFactory.mockReturnValue(userClient)

    userService = new UserService(hmppsAuthClient, userClientFactory, referenceDataClientFactory)

    userClient.getUserProfile.mockResolvedValue(userProfile)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('getActingUser', () => {
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
      expect(result.apArea).toEqual(userProfile.apArea)
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
      const response = paginatedResponseFactory.build({
        data: userFactory.buildList(4),
      }) as PaginatedResponse<ApprovedPremisesUser>

      userClient.getUsers.mockResolvedValue(response)

      const result = await userService.getUsers(token, 'test', ['applicant', 'assessor'], ['pipe'], 1, 'name', 'asc')

      expect(result).toEqual(response)

      expect(userClient.getUsers).toHaveBeenCalledWith('test', ['applicant', 'assessor'], ['pipe'], 1, 'name', 'asc')
    })
  })

  describe('updateUser', () => {
    it('calls the client method and returns the updated user', async () => {
      const userId = 'SOME_ID'
      const user = userFactory.build({ id: userId })

      userClient.updateUser.mockResolvedValue(user)

      const result = await userService.updateUser(token, user.id, {
        roles: user.roles,
        qualifications: user.qualifications,
      })

      expect(result).toEqual(user)

      expect(userClient.updateUser).toHaveBeenCalledWith(userId, {
        roles: user.roles,
        qualifications: user.qualifications,
      })
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

  describe('delete', () => {
    it('calls the client method', () => {
      const user = userFactory.build()

      userService.delete(token, user.id)

      expect(userClient.delete).toHaveBeenCalledWith(user.id)
    })
  })

  describe('reference data', () => {
    it('should return the probation regions data needed', async () => {
      const probationRegions = referenceDataFactory.probationRegions().buildList(2)

      referenceDataClient.getProbationRegions.mockResolvedValue(probationRegions)

      const result = await userService.getProbationRegions(token)
      expect(result).toEqual(probationRegions)
      expect(referenceDataClient.getProbationRegions).toHaveBeenCalled()
    })
  })
})
