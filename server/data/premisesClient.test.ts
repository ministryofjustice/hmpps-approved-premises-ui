import {
  bedDetailFactory,
  bedSummaryFactory,
  cas1PremiseCapacityFactory,
  premisesFactory,
  staffMemberFactory,
} from '../testutils/factories'
import PremisesClient from './premisesClient'
import paths from '../paths/api'
import describeClient, { describeCas1NamespaceClient } from '../testutils/describeClient'

describeClient('PremisesClient', provider => {
  let premisesClient: PremisesClient

  const token = 'token-1'

  beforeEach(() => {
    premisesClient = new PremisesClient(token)
  })

  describe('getBeds', () => {
    it('should return a list of beds for a given premises', async () => {
      const premises = premisesFactory.build()
      const beds = bedSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of beds for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.beds.index({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: beds,
        },
      })

      const output = await premisesClient.getBeds(premises.id)
      expect(output).toEqual(beds)
    })
  })

  describe('getBed', () => {
    it('should return a bed for a given premises', async () => {
      const premises = premisesFactory.build()
      const bed = bedDetailFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a bed for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.beds.show({ premisesId: premises.id, bedId: bed.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bed,
        },
      })

      const output = await premisesClient.getBed(premises.id, bed.id)
      expect(output).toEqual(bed)
    })
  })

  describe('getStaff', () => {
    it('should return a list of staff for a given premises', async () => {
      const premises = premisesFactory.build()
      const staffList = staffMemberFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a list of staff for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.staffMembers.index({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: staffList,
        },
      })

      const output = await premisesClient.getStaff(premises.id)
      expect(output).toEqual(staffList)
    })
  })
})

describeCas1NamespaceClient('PremisesCas1Client', provider => {
  let premisesClient: PremisesClient

  beforeEach(() => {
    premisesClient = new PremisesClient('token1')
  })

  describe('getCapacity', () => {
    it('should return capacity data for a given premises', async () => {
      const startDate = '2025-03-14'
      const endDate = '2025-11-11'
      const premises = premisesFactory.build()
      const premiseCapacity = cas1PremiseCapacityFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the capacity of a premise',
        withRequest: {
          method: 'GET',
          path: paths.premises.capacity({ premisesId: premises.id }),
          query: {
            startDate,
            endDate,
          },
          headers: {
            authorization: `Bearer token1`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premiseCapacity,
        },
      })

      const output = await premisesClient.getCapacity(premises.id, startDate, endDate)
      expect(output).toEqual(premiseCapacity)
    })
  })
})
