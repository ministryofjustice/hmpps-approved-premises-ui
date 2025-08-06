import { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import OutOfServiceBedService from './outOfServiceBedService'
import OutOfServiceBedClient from '../data/outOfServiceBedClient'
import Cas1ReferenceDataClient from '../data/cas1ReferenceDataClient'

import {
  cas1OutOfServiceBedReasonFactory,
  newOutOfServiceBedFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedFactory,
  paginatedResponseFactory,
} from '../testutils/factories'

jest.mock('../data/outOfServiceBedClient.ts')
jest.mock('../data/cas1ReferenceDataClient.ts')

describe('OutOfServiceBedService', () => {
  const outOfServiceBedClient = new OutOfServiceBedClient(null) as jest.Mocked<OutOfServiceBedClient>
  const cas1ReferenceDataClient = new Cas1ReferenceDataClient(null) as jest.Mocked<Cas1ReferenceDataClient>

  const OutOfServiceBedClientFactory = jest.fn()
  const Cas1ReferenceDataClientFactory = jest.fn()

  const service = new OutOfServiceBedService(OutOfServiceBedClientFactory, Cas1ReferenceDataClientFactory)

  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    OutOfServiceBedClientFactory.mockReturnValue(outOfServiceBedClient)
    Cas1ReferenceDataClientFactory.mockReturnValue(cas1ReferenceDataClient)
  })

  describe('createOutOfServiceBed', () => {
    it('on success returns the outOfServiceBed that has been posted', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build()
      const newOutOfServiceBed = newOutOfServiceBedFactory.build()

      const token = 'SOME_TOKEN'
      outOfServiceBedClient.create.mockResolvedValue(outOfServiceBed)

      const postedOutOfServiceBed = await service.createOutOfServiceBed(token, premisesId, newOutOfServiceBed)

      expect(postedOutOfServiceBed).toEqual(outOfServiceBed)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.create).toHaveBeenCalledWith(premisesId, newOutOfServiceBed)
    })
  })

  describe('getOutOfServiceBedReasons', () => {
    it('returns the list of reasons retrieved from the CAS1 reference data endpoint', async () => {
      const token = 'SOME_TOKEN'
      const outOfServiceBedReasons = cas1OutOfServiceBedReasonFactory.buildList(5)

      cas1ReferenceDataClient.getOutOfServiceBedReasons.mockResolvedValue(outOfServiceBedReasons)

      const retrievedReasons = await service.getOutOfServiceBedReasons(token)

      expect(retrievedReasons).toEqual(outOfServiceBedReasons)
      expect(Cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getOutOfServiceBedReasons).toHaveBeenCalled()
    })
  })

  describe('getOutOfServiceBed', () => {
    it('on success returns the outOfServiceBed that has been posted', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build()

      const token = 'SOME_TOKEN'
      outOfServiceBedClient.find.mockResolvedValue(outOfServiceBed)

      const postedOutOfServiceBed = await service.getOutOfServiceBed(token, premisesId, 'id')

      expect(postedOutOfServiceBed).toEqual(outOfServiceBed)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.find).toHaveBeenCalledWith(premisesId, 'id')
    })
  })

  describe('getOutOfServiceBedsForAPremises', () => {
    it('on success returns the outOfServiceBeds for a premises', async () => {
      const expectedOutOfServiceBeds = outOfServiceBedFactory.buildList(2)

      const token = 'SOME_TOKEN'
      outOfServiceBedClient.getAllByPremises.mockResolvedValue(expectedOutOfServiceBeds)

      const outOfServiceBeds = await service.getOutOfServiceBedsForAPremises(token, premisesId)

      expect(outOfServiceBeds).toEqual(expectedOutOfServiceBeds)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.getAllByPremises).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getAllOutOfServiceBeds', () => {
    const token = 'SOME_TOKEN'

    it('calls the get method on the outOfServiceBedClient with a page, perPage, sort and filter options', async () => {
      const pageNumber = 3
      const perPage = 20
      const sortBy = 'roomName'
      const sortDirection = 'asc'
      const temporality = 'future'
      const apAreaId = '123'

      const response = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      outOfServiceBedClient.get.mockResolvedValue(response)

      const outOfServiceBeds = await service.getAllOutOfServiceBeds({
        token,
        page: pageNumber,
        sortBy,
        sortDirection,
        temporality,
        apAreaId,
        premisesId,
        perPage,
      })

      expect(outOfServiceBeds).toEqual(response)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.get).toHaveBeenCalledWith({
        page: pageNumber,
        sortBy,
        sortDirection,
        temporality,
        apAreaId,
        premisesId,
        perPage,
      })
    })

    it('uses default values for page, temporality and perPage', async () => {
      const response = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      outOfServiceBedClient.get.mockResolvedValue(response)

      await service.getAllOutOfServiceBeds({ token })

      expect(outOfServiceBedClient.get).toHaveBeenCalledWith({
        page: 1,
        temporality: 'current',
        perPage: 10,
      })
    })
  })

  describe('updateOutOfServiceBed', () => {
    it('updates and returns the specified outOfService bed', async () => {
      const outOfServiceBed = outOfServiceBedFactory.build()
      const endDate = '2022-09-22'
      const notes = 'note'

      const token = 'SOME_TOKEN'
      outOfServiceBedClient.update.mockResolvedValue(outOfServiceBed)

      const outOfServiceBedUpdateData = {
        startDate: outOfServiceBed.startDate,
        endDate,
        reason: outOfServiceBed.reason.id,
        referenceNumber: outOfServiceBed.referenceNumber,
        notes,
      }

      const updatedOutOfServiceBed = await service.updateOutOfServiceBed(
        token,
        outOfServiceBed.id,
        premisesId,
        outOfServiceBedUpdateData,
      )

      expect(updatedOutOfServiceBed).toEqual(outOfServiceBed)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.update).toHaveBeenCalledWith(
        outOfServiceBed.id,
        outOfServiceBedUpdateData,
        premisesId,
      )
    })
  })

  describe('cancelOutOfServiceBed', () => {
    it('cancels and returns the cancelled outOfService bed', async () => {
      const outOfServiceBedId = 'outOfServiceBedId'
      const newOutOfServiceBedCancellation = {
        notes: 'some notes',
      }
      const outOfServiceBedCancellation = outOfServiceBedCancellationFactory.build()
      const token = 'SOME_TOKEN'

      outOfServiceBedClient.cancel.mockResolvedValue(outOfServiceBedCancellation)

      const cancelledOutOfServiceBed = await service.cancelOutOfServiceBed(
        token,
        outOfServiceBedId,
        premisesId,
        newOutOfServiceBedCancellation,
      )

      expect(cancelledOutOfServiceBed).toEqual(outOfServiceBedCancellation)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.cancel).toHaveBeenCalledWith(
        outOfServiceBedId,
        premisesId,
        newOutOfServiceBedCancellation,
      )
    })
  })
})
