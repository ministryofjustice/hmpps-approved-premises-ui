import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import type { Cas1SpaceBooking, Cas1TimelineEvent } from '@approved-premises/api'
import PlacementService from './placementService'
import PlacementClient from '../data/placementClient'
import { Cas1ReferenceDataClient } from '../data'
import {
  cas1AssignKeyWorkerFactory,
  cas1NewArrivalFactory,
  cas1NewDepartureFactory,
  cas1NewSpaceBookingCancellationFactory,
  cas1NonArrivalFactory,
  cas1SpaceBookingFactory,
  cas1TimelineEventFactory,
  cas1UpdateSpaceBookingFactory,
  departureReasonFactory,
  nonArrivalReasonsFactory,
  referenceDataFactory,
} from '../testutils/factories'

jest.mock('../data/placementClient')
jest.mock('../data/cas1ReferenceDataClient')

describe('PlacementService', () => {
  const placementClient = new PlacementClient(null) as jest.Mocked<PlacementClient>
  const cas1ReferenceDataClient = new Cas1ReferenceDataClient(null) as jest.Mocked<Cas1ReferenceDataClient>

  const placementClientFactory = jest.fn()
  const cas1ReferenceDataClientFactory = jest.fn()

  const token = 'SOME_TOKEN'
  const premisesId = 'premises-id'
  const placementId = 'placement-id'

  let placementService: PlacementService

  beforeEach(() => {
    jest.resetAllMocks()
    placementService = new PlacementService(placementClientFactory, cas1ReferenceDataClientFactory)
    placementClientFactory.mockReturnValue(placementClient)
    cas1ReferenceDataClientFactory.mockReturnValue(cas1ReferenceDataClient)
  })

  describe('getPlacement', () => {
    it('gets a placement summary by id', async () => {
      const placementSummary: Cas1SpaceBooking = cas1SpaceBookingFactory.build()

      placementClient.getPlacement.mockResolvedValue(placementSummary)

      const result = await placementService.getPlacement(token, placementId)

      expect(result).toEqual(placementSummary)
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.getPlacement).toHaveBeenCalledWith(placementId)
    })
  })

  describe('getTimeline', () => {
    it('gets a placement timeline', async () => {
      const timeLine: Array<Cas1TimelineEvent> = cas1TimelineEventFactory.buildList(10)

      placementClient.getTimeline.mockResolvedValue(timeLine)

      const result = await placementService.getTimeline({ token, premisesId, placementId })

      expect(result).toEqual(timeLine)
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.getTimeline).toHaveBeenCalledWith({ premisesId, placementId })
    })
  })

  describe('updatePlacement', () => {
    it('updates the placement', async () => {
      const placement = cas1SpaceBookingFactory.build()
      const placementUpdate = cas1UpdateSpaceBookingFactory.build()
      placementClient.updatePlacement.mockResolvedValue(placement)

      const result = await placementService.updatePlacement(token, premisesId, placementId, placementUpdate)

      expect(result).toEqual(placement)
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.updatePlacement).toHaveBeenCalledWith(premisesId, placementId, placementUpdate)
    })
  })

  describe('createArrival', () => {
    it('calls the createArrival method of the placement client and returns a response', async () => {
      const newPlacementArrival = cas1NewArrivalFactory.build()

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

      cas1ReferenceDataClient.getReferenceData.mockResolvedValue(nonArrivalReasons)

      const result = await placementService.getNonArrivalReasons(token)

      expect(result).toEqual(nonArrivalReasons)
      expect(cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getReferenceData).toHaveBeenCalledWith('non-arrival-reasons')
    })
  })

  describe('departure session data', () => {
    const page1Data = {
      departureDate: '2024-12-14T12:30:00.000Z',
      reasonId: 'reason-id',
    }
    const page2Data = {
      breachOrRecallReasonId: 'new-reason-id',
    }

    it('returns an empty session data object if no session departure data exists', async () => {
      const request = createMock<Request>()

      const result = placementService.getDepartureSessionData(placementId, request.session)

      expect(result).toEqual({})
    })

    it('returns the departure data for the given placement', () => {
      const request = createMock<Request>({
        session: { departureForms: { 'placement-id': page1Data } },
      })

      const result = placementService.getDepartureSessionData(placementId, request.session)

      expect(result).toEqual(page1Data)
    })

    it('sets the given departure data in session against the placement id', () => {
      const request = createMock<Request>()

      placementService.setDepartureSessionData(placementId, request.session, page1Data)

      expect(request.session).toEqual(
        expect.objectContaining({
          departureForms: {
            'placement-id': page1Data,
          },
        }),
      )
    })

    it('updates the existing data in session', () => {
      const request = createMock<Request>({ session: { departureForms: { 'placement-id': page1Data } } })

      placementService.setDepartureSessionData(placementId, request.session, page2Data)

      expect(request.session).toEqual(
        expect.objectContaining({
          departureForms: {
            'placement-id': {
              ...page1Data,
              breachOrRecallReasonId: 'new-reason-id',
            },
          },
        }),
      )
    })

    it('removes the existing data from session', () => {
      const request = createMock<Request>({ session: { departureForms: { 'placement-id': page1Data } } })

      placementService.removeDepartureSessionData(placementId, request.session)

      expect(request.session.departureForms).not.toHaveProperty('placement-id')
    })
  })

  describe('createDeparture', () => {
    it('calls the createDeparture method of the placement client and returns a response', async () => {
      const newPlacementDeparture = cas1NewDepartureFactory.build()

      placementClient.createDeparture.mockResolvedValue({})

      const result = await placementService.createDeparture(token, premisesId, placementId, newPlacementDeparture)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.createDeparture).toHaveBeenCalledWith(premisesId, placementId, newPlacementDeparture)
    })
  })

  describe('getDepartureReasons', () => {
    it('calls the getReferenceData method of the reference data client and returns a response', async () => {
      const departureReasons = departureReasonFactory.buildList(5)

      cas1ReferenceDataClient.getReferenceData.mockResolvedValue(departureReasons)

      const result = await placementService.getDepartureReasons(token)

      expect(result).toEqual(departureReasons)
      expect(cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getReferenceData).toHaveBeenCalledWith('departure-reasons')
    })
  })

  describe('getMoveOnCategories', () => {
    it('calls the getReferenceData method of the reference data client and returns a response', async () => {
      const moveOnCategories = referenceDataFactory.buildList(5)

      cas1ReferenceDataClient.getReferenceData.mockResolvedValue(moveOnCategories)

      const result = await placementService.getMoveOnCategories(token)

      expect(result).toEqual(moveOnCategories)
      expect(cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getReferenceData).toHaveBeenCalledWith('move-on-categories')
    })
  })

  describe('cancel', () => {
    it('calls the cancel method of the placement client and returns a response', async () => {
      const cancellation = cas1NewSpaceBookingCancellationFactory.build()
      placementClient.cancel.mockResolvedValue({})

      const result = await placementService.createCancellation(token, premisesId, placementId, cancellation)

      expect(result).toEqual({})
      expect(placementClientFactory).toHaveBeenCalledWith(token)
      expect(placementClient.cancel).toHaveBeenCalledWith(premisesId, placementId, cancellation)
    })
  })
})
