import { createMock } from '@golevelup/ts-jest'
import type { Request } from 'express'
import { SpaceSearchState } from '@approved-premises/ui'
import SpaceClient from '../data/spaceClient'
import {
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  placementRequestDetailFactory,
  spaceSearchParametersUiFactory,
  spaceSearchResultsFactory,
} from '../testutils/factories'
import SpaceService from './spaceService'

jest.mock('../data/spaceClient.ts')

describe('spaceService', () => {
  const spaceClient = new SpaceClient(null) as jest.Mocked<SpaceClient>
  const spaceClientFactory = jest.fn()

  const service = new SpaceService(spaceClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    spaceClientFactory.mockReturnValue(spaceClient)
  })

  describe('search', () => {
    it('calls the all method on the space client', async () => {
      const spaceSearchResults = spaceSearchResultsFactory.build()
      const params = spaceSearchParametersUiFactory.build()
      spaceClient.search.mockResolvedValue(spaceSearchResults)

      const result = await service.search(token, params)

      expect(result).toEqual(spaceSearchResults)

      expect(spaceClientFactory).toHaveBeenCalledWith(token)
      expect(spaceClient.search).toHaveBeenCalled()
    })
  })

  describe('createSpaceBooking', () => {
    it('should call the client', async () => {
      const newSpaceBooking = newSpaceBookingFactory.build()
      const spaceBooking = cas1SpaceBookingFactory.build()
      spaceClient.createSpaceBooking.mockResolvedValue(spaceBooking)
      const id = 'some-uuid'

      const result = await service.createSpaceBooking(token, id, newSpaceBooking)

      expect(result).toEqual(spaceBooking)
      expect(spaceClientFactory).toHaveBeenCalledWith(token)
      expect(spaceClient.createSpaceBooking).toHaveBeenCalledWith(id, newSpaceBooking)
    })
  })

  describe('space search state', () => {
    const placementRequest = placementRequestDetailFactory.build()
    const state: SpaceSearchState = {
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
        postcode: 'M21',
        apType: 'isMHAPElliottHouse',
        apCriteria: ['acceptsSexOffenders'],
        roomCriteria: ['isArsonSuitable'],
        startDate: '2025-02-15',
        durationDays: 42,
      }
      const request = createMock<Request>({ session: {} })

      service.setSpaceSearchState(placementRequest.id, request.session, initialSearchState)

      expect(request.session.spaceSearch[placementRequest.id]).toEqual(initialSearchState)
    })

    it('updates the space search state data', () => {
      const request = createMock<Request>({
        session: { spaceSearch: { [placementRequest.id]: state } },
      })

      service.setSpaceSearchState(placementRequest.id, request.session, {
        postcode: 'M16',
        apType: 'isPIPE',
        apCriteria: ['isSuitableForVulnerable'],
      })

      expect(request.session.spaceSearch[placementRequest.id]).toEqual({
        postcode: 'M16',
        apType: 'isPIPE',
        apCriteria: ['isSuitableForVulnerable'],
        roomCriteria: ['hasEnSuite'],
        startDate: '2025-02-15',
        durationDays: 84,
      })
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
