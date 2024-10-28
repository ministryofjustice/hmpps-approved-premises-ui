import { bedDetailFactory, bedSummaryFactory, premisesFactory } from '../testutils/factories'
import PremisesClient from './premisesClient'
import paths from '../paths/api'
import describeClient from '../testutils/describeClient'

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

  describe('getPlacements', () => {
    it('should return a list of placements for a premises', async () => {
      const premises = extendedPremisesSummaryFactory.build()
      const placements = cas1SpaceBookingSummaryFactory.buildList(10)
      const status = 'current'
      const sortBy = 'personName'
      const sortDirection = 'asc'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get placements for a premises',
        withRequest: {
          method: 'GET',
          path: paths.premises.placements({ premisesId: premises.id }),
          query: { residency: status, sortBy, sortDirection },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: placements,
        },
      })

      const output = await premisesClient.getPlacements(premises.id, status, sortBy, sortDirection)
      expect(output).toEqual(placements)
    })
  })
})
