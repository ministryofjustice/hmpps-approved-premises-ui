import LostBedClient from './lostBedClient'
import lostBedFactory from '../testutils/factories/lostBed'
import newLostBedFactory from '../testutils/factories/newLostBed'
import describeClient from '../testutils/describeClient'

describeClient('LostBedClient', provider => {
  let lostBedClient: LostBedClient

  const token = 'token-1'

  beforeEach(() => {
    lostBedClient = new LostBedClient(token)
  })

  describe('create', () => {
    it('should create a lostBed', async () => {
      const lostBed = lostBedFactory.build({
        cancellation: {},
      })
      const newLostBed = newLostBedFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a lost bed',
        withRequest: {
          method: 'POST',
          path: `/premises/premisesId/lost-beds`,
          body: newLostBed,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: lostBed,
        },
      })

      const result = await lostBedClient.create('premisesId', newLostBed)

      expect(result).toEqual(lostBed)
    })
  })
})
