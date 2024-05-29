import LostBedClient from './lostBedClient'
import { lostBedCancellationFactory, lostBedFactory, newLostBedFactory } from '../testutils/factories'
import paths from '../paths/api'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import { NewLostBedCancellation } from '../@types/shared'

describeCas1NamespaceClient('LostBedClient', provider => {
  let lostBedClient: LostBedClient

  const token = 'token-1'

  const premisesId = 'premisesId'

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
          path: paths.premises.lostBeds.create({ premisesId }),
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

      const result = await lostBedClient.create(premisesId, newLostBed)

      expect(result).toEqual(lostBed)
    })
  })

  describe('find', () => {
    it('should fetch a lostBed', async () => {
      const lostBed = lostBedFactory.build({
        cancellation: {},
      })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a lost bed',
        withRequest: {
          method: 'GET',
          path: paths.premises.lostBeds.show({ premisesId, id: lostBed.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: lostBed,
        },
      })

      const result = await lostBedClient.find('premisesId', lostBed.id)

      expect(result).toEqual(lostBed)
    })
  })

  describe('get', () => {
    it('should get all lostBeds for a premises', async () => {
      const lostBeds = lostBedFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get lost beds',
        withRequest: {
          method: 'GET',
          path: paths.premises.lostBeds.index({ premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: lostBeds,
        },
      })

      const result = await lostBedClient.get('premisesId')

      expect(result).toEqual(lostBeds)
    })
  })

  describe('update', () => {
    it('updates a lost bed', async () => {
      const lostBed = lostBedFactory.build()
      const endDate = '2022-09-22'
      const notes = 'note'

      const lostBedUpdateData = {
        startDate: lostBed.startDate,
        endDate,
        reason: lostBed.reason.id,
        referenceNumber: lostBed.referenceNumber,
        notes,
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a lost bed',
        withRequest: {
          method: 'PUT',
          path: paths.premises.lostBeds.update({ premisesId, id: lostBed.id }),
          body: lostBedUpdateData,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: lostBed,
        },
      })

      const result = await lostBedClient.update(lostBed.id, lostBedUpdateData, 'premisesId')

      expect(result).toEqual(lostBed)
    })
  })

  describe('cancel', () => {
    it('cancels a lost bed', async () => {
      const lostBedCancellation = lostBedCancellationFactory.build()
      const notes = 'note'

      const lostBedCancellationData: NewLostBedCancellation = {
        notes,
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to cancel a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.premises.lostBeds.cancel({ premisesId, id: lostBedCancellation.id }),
          body: lostBedCancellationData,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: lostBedCancellation,
        },
      })

      const result = await lostBedClient.cancel(lostBedCancellation.id, 'premisesId', lostBedCancellationData)

      expect(result).toEqual(lostBedCancellation)
    })
  })
})
