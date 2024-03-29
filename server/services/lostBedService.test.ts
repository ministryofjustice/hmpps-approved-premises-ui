import type { LostBed, NewLostBed, NewLostBedCancellation } from '@approved-premises/api'

import LostBedService from './lostBedService'
import LostBedClient from '../data/lostBedClient'
import ReferenceDataClient from '../data/referenceDataClient'

import {
  lostBedCancellationFactory,
  lostBedFactory,
  newLostBedFactory,
  referenceDataFactory,
} from '../testutils/factories'

jest.mock('../data/lostBedClient.ts')
jest.mock('../data/referenceDataClient.ts')

describe('LostBedService', () => {
  const lostBedClient = new LostBedClient(null) as jest.Mocked<LostBedClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const LostBedClientFactory = jest.fn()
  const ReferenceDataClientFactory = jest.fn()

  const service = new LostBedService(LostBedClientFactory, ReferenceDataClientFactory)

  const premisesId = 'premisesId'

  beforeEach(() => {
    jest.resetAllMocks()
    LostBedClientFactory.mockReturnValue(lostBedClient)
    ReferenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createLostBed', () => {
    it('on success returns the lostBed that has been posted', async () => {
      const lostBed: LostBed = lostBedFactory.build()
      const newLostBed: NewLostBed = newLostBedFactory.build()

      const token = 'SOME_TOKEN'
      lostBedClient.create.mockResolvedValue(lostBed)

      const postedLostBed = await service.createLostBed(token, premisesId, newLostBed)

      expect(postedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(token)
      expect(lostBedClient.create).toHaveBeenCalledWith(premisesId, newLostBed)
    })
  })

  describe('getLostBed', () => {
    it('on success returns the lostBed that has been posted', async () => {
      const lostBed: LostBed = lostBedFactory.build()

      const token = 'SOME_TOKEN'
      lostBedClient.find.mockResolvedValue(lostBed)

      const postedLostBed = await service.getLostBed(token, premisesId, 'id')

      expect(postedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(token)
      expect(lostBedClient.find).toHaveBeenCalledWith(premisesId, 'id')
    })
  })

  describe('getLostBeds', () => {
    it('on success returns the lostBeds for a premises', async () => {
      const expectedLostBeds: Array<LostBed> = lostBedFactory.buildList(2)

      const token = 'SOME_TOKEN'
      lostBedClient.get.mockResolvedValue(expectedLostBeds)

      const lostBeds = await service.getLostBeds(token, premisesId)

      expect(lostBeds).toEqual(expectedLostBeds)
      expect(LostBedClientFactory).toHaveBeenCalledWith(token)
      expect(lostBedClient.get).toHaveBeenCalledWith(premisesId)
    })
  })

  describe('getReferenceData', () => {
    it('should return the lost bed reasons data needed', async () => {
      const lostBedReasons = referenceDataFactory.buildList(2)
      const token = 'SOME_TOKEN'

      referenceDataClient.getReferenceData.mockImplementation(category => {
        return Promise.resolve(
          {
            'lost-bed-reasons': lostBedReasons,
          }[category],
        )
      })

      const result = await service.getReferenceData(token)

      expect(result).toEqual(lostBedReasons)
      expect(ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('lost-bed-reasons')
    })
  })

  describe('updateLostBed', () => {
    it('updates and returns the specified lost bed', async () => {
      const lostBed: LostBed = lostBedFactory.build()
      const endDate = '2022-09-22'
      const notes = 'note'

      const token = 'SOME_TOKEN'
      lostBedClient.update.mockResolvedValue(lostBed)

      const lostBedUpdateData = {
        startDate: lostBed.startDate,
        endDate,
        reason: lostBed.reason.id,
        referenceNumber: lostBed.referenceNumber,
        notes,
      }

      const updatedLostBed = await service.updateLostBed(token, lostBed.id, premisesId, lostBedUpdateData)

      expect(updatedLostBed).toEqual(lostBed)
      expect(LostBedClientFactory).toHaveBeenCalledWith(token)
      expect(lostBedClient.update).toHaveBeenCalledWith(lostBed.id, lostBedUpdateData, premisesId)
    })
  })

  describe('cancelLostBed', () => {
    it('cancels and returns the cancelled lost bed', async () => {
      const lostBedId = 'lostBedId'
      const newLostBedCancellation: NewLostBedCancellation = {
        notes: 'some notes',
      }
      const lostBedCancellation = lostBedCancellationFactory.build()
      const token = 'SOME_TOKEN'

      lostBedClient.cancel.mockResolvedValue(lostBedCancellation)

      const cancelledLostBed = await service.cancelLostBed(token, lostBedId, premisesId, newLostBedCancellation)

      expect(cancelledLostBed).toEqual(lostBedCancellation)
      expect(LostBedClientFactory).toHaveBeenCalledWith(token)
      expect(lostBedClient.cancel).toHaveBeenCalledWith(lostBedId, premisesId, newLostBedCancellation)
    })
  })
})
