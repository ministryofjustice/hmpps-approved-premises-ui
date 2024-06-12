import { Cas1OutOfServiceBed as OutOfServiceBed } from '@approved-premises/api'
import { PaginatedResponse } from '@approved-premises/ui'
import OutOfServiceBedService from './outOfServiceBedService'
import OutOfServiceBedClient from '../data/outOfServiceBedClient'

import {
  newOutOfServiceBedFactory,
  outOfServiceBedCancellationFactory,
  outOfServiceBedFactory,
  paginatedResponseFactory,
} from '../testutils/factories'

jest.mock('../data/outOfServiceBedClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('OutOfServiceBedService', () => {
  const outOfServiceBedClient = new OutOfServiceBedClient(null) as jest.Mocked<OutOfServiceBedClient>

  const OutOfServiceBedClientFactory = jest.fn()

  const service = new OutOfServiceBedService(OutOfServiceBedClientFactory)

  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    OutOfServiceBedClientFactory.mockReturnValue(outOfServiceBedClient)
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
    it('calls the get method on the outOfServiceBedClient with a page and sort options', async () => {
      const token = 'SOME_TOKEN'

      const response = paginatedResponseFactory.build({
        data: outOfServiceBedFactory.buildList(1),
      }) as PaginatedResponse<OutOfServiceBed>
      outOfServiceBedClient.get.mockResolvedValue(response)

      const outOfServiceBeds = await service.getAllOutOfServiceBeds(token, 3)

      expect(outOfServiceBeds).toEqual(response)
      expect(OutOfServiceBedClientFactory).toHaveBeenCalledWith(token)
      expect(outOfServiceBedClient.get).toHaveBeenCalledWith('outOfServiceFrom', 'asc', 3)
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
        startDate: outOfServiceBed.outOfServiceFrom,
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
