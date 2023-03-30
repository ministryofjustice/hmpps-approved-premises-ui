import { dateCapacityFactory, premisesFactory, staffMemberFactory } from '../testutils/factories'
import PremisesClient from './premisesClient'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

describeClient('PremisesClient', provider => {
  let premisesClient: PremisesClient

  const token = 'token-1'

  beforeEach(() => {
    premisesClient = new PremisesClient(token)
  })

  describe('all', () => {
    const premises = premisesFactory.buildList(5)

    it('should get all premises', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.index({}),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premises,
        },
      })

      const output = await premisesClient.all()
      expect(output).toEqual(premises)
    })
  })

  describe('find', () => {
    const premises = premisesFactory.build()

    it('should get a single premises', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.show({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premises,
        },
      })

      const output = await premisesClient.find(premises.id)
      expect(output).toEqual(premises)
    })
  })

  describe('capacity', () => {
    const premisesId = 'premisesId'
    const premisesCapacityItems = dateCapacityFactory.buildList(5)

    it('should get the capacity of a premises for a given date', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the capacity for a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.capacity({ premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premisesCapacityItems,
        },
      })

      const output = await premisesClient.capacity(premisesId)
      expect(output).toEqual(premisesCapacityItems)
    })
  })

  describe('getStaffMembers', () => {
    const premises = premisesFactory.build()
    const staffMembers = staffMemberFactory.buildList(5)

    it('should return a list of staff members', async () => {
      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get staff members for a single premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.staffMembers.index({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: staffMembers,
        },
      })

      const output = await premisesClient.getStaffMembers(premises.id)
      expect(output).toEqual(staffMembers)
    })
  })
})
