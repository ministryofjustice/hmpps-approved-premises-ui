import { Cas1UpdateUser } from '@approved-premises/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import UserClient from './userClient'
import { userFactory } from '../testutils/factories'
import paths from '../paths/api'

describeCas1NamespaceClient('Cas1UserClient', provider => {
  let userClient: UserClient

  const token = 'token-1'

  beforeEach(() => {
    userClient = new UserClient(token)
  })

  describe('getUser', () => {
    const user = userFactory.build()

    it('should return a user', async () => {
      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a user',
        withRequest: {
          method: 'GET',
          path: paths.users.show({ id: user.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: user,
        },
      })

      const output = await userClient.getUser(user.id)
      expect(output).toEqual(user)
    })
  })

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = userFactory.build()

      const updateUserData: Cas1UpdateUser = {
        roles: user.roles,
        qualifications: user.qualifications,
        cruManagementAreaOverrideId: user.cruManagementAreaOverride.id,
      }

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a user',
        withRequest: {
          method: 'PUT',
          path: paths.users.update({ id: user.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: updateUserData,
        },
        willRespondWith: {
          status: 200,
          body: user,
        },
      })

      const output = await userClient.updateUser(user.id, updateUserData)
      expect(output).toEqual(user)
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = userFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to delete a user',
        withRequest: {
          method: 'DELETE',
          path: paths.users.delete({ id: user.id }),
          headers: {
            authorization: `Bearer ${token}`,
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
