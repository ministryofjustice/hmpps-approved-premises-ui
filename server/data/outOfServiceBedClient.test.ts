import {
  NewCas1OutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
  UpdateCas1OutOfServiceBed as UpdateOutOfServiceBed,
} from '@approved-premises/api'
import OutOfServiceBedClient from './outOfServiceBedClient'
import {
  newOutOfServiceBedFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedFactory,
} from '../testutils/factories'
import { describeCas1NamespaceClient } from '../testutils/describeClient'
import paths from '../paths/api'

describeCas1NamespaceClient('OutOfServiceBedClient', provider => {
  let outOfServiceBedClient: OutOfServiceBedClient

  const token = 'token-1'

  const premisesId = 'premisesId'

  beforeEach(() => {
    outOfServiceBedClient = new OutOfServiceBedClient(token)
  })

  describe('create', () => {
    it('should create a outOfServiceBed', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build({})
      const newOutOfServiceBed = newOutOfServiceBedFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to create a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.manage.premises.outOfServiceBeds.create({ premisesId }),
          body: newOutOfServiceBed,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBed,
        },
      })

      const result = await outOfServiceBedClient.create(premisesId, newOutOfServiceBed)

      expect(result).toEqual(outOfServiceBed)
    })
  })

  describe('find', () => {
    it('should fetch a outOfServiceBed', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build({
        cancellation: {},
      })

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to find a lost bed',
        withRequest: {
          method: 'GET',
          path: paths.manage.premises.outOfServiceBeds.show({ premisesId, id: outOfServiceBed.id }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBed,
        },
      })

      const result = await outOfServiceBedClient.find('premisesId', outOfServiceBed.id)

      expect(result).toEqual(outOfServiceBed)
    })
  })

  describe('get', () => {
    it('should get all outOfServiceBeds for a premises', async () => {
      const outOfServiceBeds = outOfServiceBedFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get lost beds',
        withRequest: {
          method: 'GET',
          path: paths.manage.premises.outOfServiceBeds.index({ premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBeds,
        },
      })

      const result = await outOfServiceBedClient.get('premisesId')

      expect(result).toEqual(outOfServiceBeds)
    })
  })

  describe('update', () => {
    it('updates a lost bed', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build()
      const endDate = '2022-09-22'
      const notes = 'note'

      const outOfServiceBedUpdateData: UpdateOutOfServiceBed = {
        startDate: outOfServiceBed.outOfServiceFrom,
        endDate,
        reason: outOfServiceBed.reason.id,
        referenceNumber: outOfServiceBed.referenceNumber,
        notes,
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to update a lost bed',
        withRequest: {
          method: 'PUT',
          path: paths.manage.premises.outOfServiceBeds.update({ premisesId, id: outOfServiceBed.id }),
          body: outOfServiceBedUpdateData,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBed,
        },
      })

      const result = await outOfServiceBedClient.update(outOfServiceBed.id, outOfServiceBedUpdateData, 'premisesId')

      expect(result).toEqual(outOfServiceBed)
    })
  })

  describe('cancel', () => {
    it('cancels a lost bed', async () => {
      const outOfServiceBedCancellation = outOfServiceBedCancellationFactory.build()
      const notes = 'note'

      const outOfServiceBedCancellationData: NewOutOfServiceBedCancellation = {
        notes,
      }

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to cancel a lost bed',
        withRequest: {
          method: 'POST',
          path: paths.manage.premises.outOfServiceBeds.cancel({ premisesId, id: outOfServiceBedCancellation.id }),
          body: outOfServiceBedCancellationData,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBedCancellation,
        },
      })

      const result = await outOfServiceBedClient.cancel(
        outOfServiceBedCancellation.id,
        'premisesId',
        outOfServiceBedCancellationData,
      )

      expect(result).toEqual(outOfServiceBedCancellation)
    })
  })
})
