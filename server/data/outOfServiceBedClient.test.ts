import type {
  Cas1NewOutOfServiceBedCancellation as NewOutOfServiceBedCancellation,
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

  describe('getAllByPremises', () => {
    it('should get all outOfServiceBeds for a premises', async () => {
      const outOfServiceBeds = outOfServiceBedFactory.buildList(2)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get lost beds',
        withRequest: {
          method: 'GET',
          path: paths.manage.premises.outOfServiceBeds.premisesIndex({ premisesId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBeds,
        },
      })

      const result = await outOfServiceBedClient.getAllByPremises('premisesId')

      expect(result).toEqual(outOfServiceBeds)
    })
  })

  describe('get', () => {
    it('makes a request to the outOfServiceBeds endpoint with a page number, perPage, sort and filter options', async () => {
      const outOfServiceBeds = outOfServiceBedFactory.buildList(2)

      const pageNumber = 3
      const perPage = 20
      const sortBy = 'roomName'
      const sortDirection = 'asc'
      const temporality = 'future'
      const apAreaId = '123'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get out of service beds',
        withRequest: {
          method: 'GET',
          path: paths.manage.outOfServiceBeds.index({}),
          query: {
            page: pageNumber.toString(),
            sortBy,
            sortDirection,
            temporality,
            apAreaId,
            perPage: perPage.toString(),
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: outOfServiceBeds,
          headers: {
            'X-Pagination-TotalPages': '5',
            'X-Pagination-TotalResults': '100',
            'X-Pagination-PageSize': '20',
          },
        },
      })

      const result = await outOfServiceBedClient.get({
        page: pageNumber,
        sortBy,
        sortDirection,
        temporality,
        apAreaId,
        perPage,
      })

      expect(result).toEqual({
        data: outOfServiceBeds,
        pageNumber: pageNumber.toString(),
        totalPages: '5',
        totalResults: '100',
        pageSize: '20',
      })
    })
  })

  describe('update', () => {
    it('updates a lost bed', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build()
      const endDate = '2022-09-22'
      const notes = 'note'

      const outOfServiceBedUpdateData: UpdateOutOfServiceBed = {
        startDate: outOfServiceBed.startDate,
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
