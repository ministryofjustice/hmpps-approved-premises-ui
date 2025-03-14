import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import SpaceSearchClient from '../data/spaceSearchClient'
import {
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  placementRequestDetailFactory,
  spaceSearchResultsFactory,
  spaceSearchStateFactory,
} from '../testutils/factories'
import SpaceSearchService from './spaceSearchService'
import { SpaceSearchState } from '../utils/match'

jest.mock('../data/spaceSearchClient.ts')

describe('spaceSearchService', () => {
  const spaceSearchClient = new SpaceSearchClient(null) as jest.Mocked<SpaceSearchClient>
  const spaceSearchClientFactory = jest.fn()

  const service = new SpaceSearchService(spaceSearchClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    spaceSearchClientFactory.mockReturnValue(spaceSearchClient)
  })

  describe('search', () => {
    it('calls the all method on the space client', async () => {
      const spaceSearchResults = spaceSearchResultsFactory.build()
      const searchState = spaceSearchStateFactory.build()

      spaceSearchClient.search.mockResolvedValue(spaceSearchResults)

      const result = await service.search(token, searchState)

      expect(result).toEqual(spaceSearchResults)

      expect(spaceSearchClientFactory).toHaveBeenCalledWith(token)
      expect(spaceSearchClient.search).toHaveBeenCalled()
    })
  })

  describe('createSpaceBooking', () => {
    it('should call the client', async () => {
      const newSpaceBooking = newSpaceBookingFactory.build()
      const spaceBooking = cas1SpaceBookingFactory.build()
      spaceSearchClient.createSpaceBooking.mockResolvedValue(spaceBooking)
      const id = 'some-uuid'

      const result = await service.createSpaceBooking(token, id, newSpaceBooking)

      expect(result).toEqual(spaceBooking)
      expect(spaceSearchClientFactory).toHaveBeenCalledWith(token)
      expect(spaceSearchClient.createSpaceBooking).toHaveBeenCalledWith(id, newSpaceBooking)
    })
  })

  describe('space search state', () => {
    const placementRequest = placementRequestDetailFactory.build()
    const state: SpaceSearchState = {
      applicationId: 'application-id',
      postcode: 'B12',
      apType: 'normal',
      apCriteria: ['isCatered'],
      roomCriteria: ['hasEnSuite'],
      startDate: '2025-02-15',
      durationDays: 84,
    }

    it('returns the existing space search state for the given placement request', () => {
      const request = createMock<Request>({
        session: { spaceSearch: { [placementRequest.id]: state } },
      })

      const result = service.getSpaceSearchState(placementRequest.id, request.session)

      expect(result).toEqual(state)
    })

    it('sets the space search state with initial data', () => {
      const initialSearchState: SpaceSearchState = {
        applicationId: 'application-id',
        postcode: 'M21',
        apType: 'isMHAPElliottHouse',
        apCriteria: ['acceptsSexOffenders'],
        roomCriteria: ['isArsonSuitable'],
        startDate: '2025-02-15',
        durationDays: 42,
      }
      const request = createMock<Request>({ session: {} })

      const result = service.setSpaceSearchState(placementRequest.id, request.session, initialSearchState)

      expect(result).toEqual(initialSearchState)
      expect(request.session.spaceSearch[placementRequest.id]).toEqual(initialSearchState)
    })

    it('updates the space search state data', () => {
      const request = createMock<Request>({
        session: { spaceSearch: { [placementRequest.id]: state } },
      })
      const expectedSearchState = {
        applicationId: 'application-id',
        postcode: 'M16',
        apType: 'isPIPE',
        apCriteria: ['isSuitableForVulnerable'],
        roomCriteria: ['hasEnSuite'],
        startDate: '2025-02-15',
        durationDays: 84,
      }

      const result = service.setSpaceSearchState(placementRequest.id, request.session, {
        postcode: 'M16',
        apType: 'isPIPE',
        apCriteria: ['isSuitableForVulnerable'],
      })

      expect(result).toEqual(expectedSearchState)
      expect(request.session.spaceSearch[placementRequest.id]).toEqual(expectedSearchState)
    })

    it('removes the existing space search state for a given placement request', () => {
      const request = createMock<Request>({
        session: { spaceSearch: { [placementRequest.id]: state } },
      })

      service.removeSpaceSearchState(placementRequest.id, request.session)

      expect(request.session.spaceSearch).not.toHaveProperty(placementRequest.id)
    })
  })
})
