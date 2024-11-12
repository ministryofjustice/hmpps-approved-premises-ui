import PlacementService from './placementService'
import PlacementClient from '../data/placementClient'
import { ReferenceDataClient } from '../data'
import {
  cas1AssignKeyWorkerFactory,
  cas1NonArrivalFactory,
  newPlacementArrivalFactory,
  newPlacementDepartureFactory,
  nonArrivalReasonsFactory,
  referenceDataFactory,
} from '../testutils/factories'

jest.mock('../data/placementClient')
jest.mock('../data/referenceDataClient')

describe('PlacementService', () => {
  const placementClient = new PlacementClient(null) as jest.Mocked<PlacementClient>
  const referenceDataClient = new ReferenceDataClient(null) as jest.Mocked<ReferenceDataClient>

  const placementClientFactory = jest.fn()
  const referenceDataClientFactory = jest.fn()

  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'
  const placementId = 'placementId'

  let placementService: PlacementService

  beforeEach(() => {
    jest.resetAllMocks()
    placementService = new PlacementService(placementClientFactory, referenceDataClientFactory)
    placementClientFactory.mockReturnValue(placementClient)
    referenceDataClientFactory.mockReturnValue(referenceDataClient)
  })

  describe('createArrival', () => {
    it('calls the createArrival method of the placement client and returns a response', async () => {
      const newPlacementArrival = newPlacementArrivalFactory.build()

      placementClient.createArrival.mockResolvedValue({})

      const result = await placementService.createArrival(token, premisesId, placementId, newPlacementArrival)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.createArrival).toHaveBeenCalledWith(premisesId, placementId, newPlacementArrival)
    })
  })

  describe('assignKeyworker', () => {
    it('calls the assignKeyworker method of the placement client an returns a response', async () => {
      const assignKeyworker = cas1AssignKeyWorkerFactory.build()
      placementClient.assignKeyworker.mockResolvedValue({})

      const result = await placementService.assignKeyworker(token, premisesId, placementId, assignKeyworker)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.assignKeyworker).toHaveBeenCalledWith(premisesId, placementId, assignKeyworker)
    })
  })

  describe('recordNonArrival', () => {
    it('calls the recordNonArrival method of the placement client and returns a response', async () => {
      const nonArrival = cas1NonArrivalFactory.build()
      placementClient.recordNonArrival.mockResolvedValue({})

      const result = await placementService.recordNonArrival(token, premisesId, placementId, nonArrival)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.recordNonArrival).toHaveBeenCalledWith(premisesId, placementId, nonArrival)
    })
  })

  describe('getNonArrivalReasons', () => {
    it('loads the non-arrival reasons from the reference data client', async () => {
      const nonArrivalReasons = nonArrivalReasonsFactory.buildList(20)
      referenceDataClient.getNonArrivalReasons.mockResolvedValue(nonArrivalReasons)

      const result = await placementService.getNonArrivalReasons(token)

      expect(result).toEqual(nonArrivalReasons.filter(({ isActive }) => isActive))
    })
  })

  describe('createDeparture', () => {
    it('calls the createDeparture method of the placement client and returns a response', async () => {
      const newPlacementDeparture = newPlacementDepartureFactory.build()

      placementClient.createDeparture.mockResolvedValue({})

      const result = await service.createDeparture(token, premisesId, placementId, newPlacementDeparture)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.createDeparture).toHaveBeenCalledWith(premisesId, placementId, newPlacementDeparture)
    })
  })

  describe('getDepartureReasons', () => {
    it('calls the getReferenceData method of teh reference data client and returns a response', async () => {
      const departureReasons = referenceDataFactory.buildList(5)

      referenceDataClient.getReferenceData.mockResolvedValue(departureReasons)

      const result = await service.getDepartureReasons(token)

      expect(result).toEqual(departureReasons)
      expect(referenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(referenceDataClient.getReferenceData).toHaveBeenCalledWith('departure-reasons')
    })
  })
})
