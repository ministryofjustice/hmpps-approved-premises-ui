import { PlacementRequest, PlacementRequestDetail, WithdrawPlacementRequestReason } from '@approved-premises/api'
import PlacementRequestClient, { DashboardFilters } from '../data/placementRequestClient'
import {
  bookingNotMadeFactory,
  newPlacementRequestBookingConfirmationFactory,
  paginatedResponseFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
} from '../testutils/factories'
import PlacementRequestService from './placementRequestService'
import { PaginatedResponse } from '../@types/ui'

jest.mock('../data/placementRequestClient.ts')

describe('placementRequestService', () => {
  const placementRequestClient = new PlacementRequestClient(null) as jest.Mocked<PlacementRequestClient>
  const placementRequestClientFactory = jest.fn()

  const service = new PlacementRequestService(placementRequestClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestClientFactory.mockReturnValue(placementRequestClient)
  })

  describe('getDashboard', () => {
    const defaultFilters: DashboardFilters = {
      status: 'notMatched',
      requestType: 'standardRelease',
      cruManagementAreaId: '',
    }

    it('calls the find method on the placementRequest client', async () => {
      const response = paginatedResponseFactory.build({
        data: placementRequestFactory.buildList(4, { status: 'notMatched' }),
      }) as PaginatedResponse<PlacementRequest>

      placementRequestClient.dashboard.mockResolvedValue(response)

      const result = await service.getDashboard(token, defaultFilters)

      expect(result).toEqual(response)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith(defaultFilters, 1, 'created_at', 'asc')
    })

    it('calls the find method on the placementRequest client with page and sort options', async () => {
      const response = paginatedResponseFactory.build({
        data: placementRequestFactory.buildList(4, { status: 'notMatched' }),
      }) as PaginatedResponse<PlacementRequest>

      placementRequestClient.dashboard.mockResolvedValue(response)

      const result = await service.getDashboard(token, defaultFilters, 2, 'duration', 'desc')

      expect(result).toEqual(response)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith(defaultFilters, 2, 'duration', 'desc')
    })
  })

  describe('search', () => {
    it('calls the dashboard method on the placementRequest client', async () => {
      const response = paginatedResponseFactory.build({
        data: placementRequestFactory.buildList(4),
      }) as PaginatedResponse<PlacementRequest>

      placementRequestClient.dashboard.mockResolvedValue(response)

      const result = await service.search(token, { crnOrName: 'CRN123' })

      expect(result).toEqual(response)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith({ crnOrName: 'CRN123' }, 1, 'created_at', 'asc')
    })

    it('calls the dashboard method on the placementRequest client with optional search params', async () => {
      const response = paginatedResponseFactory.build({
        data: placementRequestFactory.buildList(4),
      }) as PaginatedResponse<PlacementRequest>

      placementRequestClient.dashboard.mockResolvedValue(response)

      const result = await service.search(token, {
        crnOrName: 'CRN123',
        tier: 'A1',
        arrivalDateStart: '2022-01-01',
        arrivalDateEnd: '2022-01-02',
      })

      expect(result).toEqual(response)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith(
        { crnOrName: 'CRN123', tier: 'A1', arrivalDateStart: '2022-01-01', arrivalDateEnd: '2022-01-02' },
        1,
        'created_at',
        'asc',
      )
    })

    it('calls the dashboard method on the placementRequest client with page and sort options', async () => {
      const response = paginatedResponseFactory.build({
        data: placementRequestFactory.buildList(4),
      }) as PaginatedResponse<PlacementRequest>

      placementRequestClient.dashboard.mockResolvedValue(response)

      const result = await service.search(token, { crnOrName: 'CRN123' }, 2, 'duration', 'desc')

      expect(result).toEqual(response)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith({ crnOrName: 'CRN123' }, 2, 'duration', 'desc')
    })
  })

  describe('getPlacementRequest', () => {
    it('calls the find method on the placementRequest client', async () => {
      const placementRequestDetail: PlacementRequestDetail = placementRequestDetailFactory.build()
      placementRequestClient.find.mockResolvedValue(placementRequestDetail)

      const result = await service.getPlacementRequest(token, placementRequestDetail.id)

      expect(result).toEqual(placementRequestDetail)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.find).toHaveBeenCalledWith(placementRequestDetail.id)
    })
  })

  describe('createBooking', () => {
    it('should transform and create a booking', async () => {
      const bookingConfirmation = newPlacementRequestBookingConfirmationFactory.build()
      placementRequestClient.createBooking.mockResolvedValue(bookingConfirmation)

      const id = 'some-uuid'
      const newBooking = {
        bedId: 'some-other-uuid',
        arrivalDate: '2022-01-01',
        departureDate: '2022-01-29',
      }

      const result = await service.createBooking(token, id, newBooking)

      expect(result).toEqual(bookingConfirmation)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.createBooking).toHaveBeenCalledWith(id, newBooking)
    })
  })

  describe('bookingNotMade', () => {
    it('it should call the service and return the booking not made object', async () => {
      const bookingNotMade = bookingNotMadeFactory.build()
      placementRequestClient.bookingNotMade.mockResolvedValue(bookingNotMade)

      const id = 'some-uuid'
      const body = {
        notes: 'some notes',
      }

      const result = await service.bookingNotMade(token, id, body)

      expect(result).toEqual(bookingNotMade)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.bookingNotMade).toHaveBeenCalledWith(id, body)
    })
  })

  describe('withdraw', () => {
    it('it should call the service', async () => {
      const placementRequestDetail = placementRequestDetailFactory.build()
      placementRequestClient.withdraw.mockResolvedValue(placementRequestDetail)

      const reason: WithdrawPlacementRequestReason = 'AlternativeProvisionIdentified'
      const id = 'some-uuid'

      await service.withdraw(token, id, reason)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.withdraw).toHaveBeenCalledWith(id, reason)
    })
  })
})
