import {
  bedDetailFactory,
  bedOccupancyRangeFactory,
  bedSummaryFactory,
  dateCapacityFactory,
  extendedPremisesSummaryFactory,
  premisesFactory,
  premisesSummaryFactory,
  roomFactory,
  staffMemberFactory,
} from '../testutils/factories'
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
    it('should get all premises', async () => {
      const apAreaId = 'test'
      const premisesSummaries = premisesSummaryFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get all premises summaries',
        withRequest: {
          method: 'GET',
          path: paths.premises.index({}),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
          },
          query: { apAreaId },
        },
        willRespondWith: {
          status: 200,
          body: premisesSummaries,
        },
      })

      const output = await premisesClient.all(apAreaId)
      expect(output).toEqual(premisesSummaries)
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

  describe('getRooms', () => {
    it('should return a list of rooms for a given premises', async () => {
      const premises = premisesFactory.build()
      const rooms = roomFactory.buildList(1)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get rooms for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.rooms({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: rooms,
        },
      })

      const output = await premisesClient.getRooms(premises.id)
      expect(output).toEqual(rooms)
    })
  })

  describe('getRoom', () => {
    it('should return a single room for a given premises', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a room for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.room({ premisesId: premises.id, roomId: room.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: room,
        },
      })

      const output = await premisesClient.getRoom(premises.id, room.id)
      expect(output).toEqual(room)
    })
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

  describe('calendar', () => {
    it('should return the occupancy of the premises for a given date range', async () => {
      const premises = premisesFactory.build()
      const startDate = '2020-01-01'
      const endDate = '2020-01-31'

      const result = bedOccupancyRangeFactory.buildList(1)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a calendar for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.calendar({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
          query: { endDate, startDate },
        },
        willRespondWith: {
          status: 200,
          body: result,
        },
      })

      const output = await premisesClient.calendar(premises.id, startDate, endDate)
      expect(output).toEqual(result)
    })
  })

  describe('summary', () => {
    it('should return an extended summary of a premises', async () => {
      const premises = extendedPremisesSummaryFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a calendar for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.summary({ premisesId: premises.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: premises,
        },
      })

      const output = await premisesClient.summary(premises.id)
      expect(output).toEqual(premises)
    })
  })
})
