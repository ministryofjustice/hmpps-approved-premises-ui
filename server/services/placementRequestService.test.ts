import { PlacementRequestDetail } from '@approved-premises/api'
import PlacementRequestClient from '../data/placementRequestClient'
import {
  bookingNotMadeFactory,
  newPlacementRequestBookingConfirmationFactory,
  placementRequestDetailFactory,
  placementRequestFactory,
} from '../testutils/factories'
import PlacementRequestService from './placementRequestService'

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

  describe('getAll', () => {
    it('returns grouped placement requests', async () => {
      const unmatchedPlacementRequests = placementRequestFactory.buildList(4, { status: 'notMatched' })
      const unableToMatchPlacementRequests = placementRequestFactory.buildList(3, { status: 'unableToMatch' })
      const matchedPlacementRequests = placementRequestFactory.buildList(2, { status: 'matched' })

      placementRequestClient.all.mockResolvedValue([
        ...unmatchedPlacementRequests,
        ...unableToMatchPlacementRequests,
        ...matchedPlacementRequests,
      ])

      const result = await service.getAll(token)

      expect(result.matched).toEqual(matchedPlacementRequests)
      expect(result.unableToMatch).toEqual(unableToMatchPlacementRequests)
      expect(result.notMatched).toEqual(unmatchedPlacementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.all).toHaveBeenCalled()
    })
  })

  describe('getDashboard', () => {
    it('calls the find method on the placementRequest client', async () => {
      const placementRequests = placementRequestFactory.buildList(4, { status: 'notMatched' })
      placementRequestClient.dashboard.mockResolvedValue(placementRequests)

      const result = await service.getDashboard(token, false)

      expect(result).toEqual(placementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith(false, 1, 'createdAt')
    })

    it('calls the find method on the placementRequest client with page and sort options', async () => {
      const placementRequests = placementRequestFactory.buildList(4, { status: 'notMatched' })
      placementRequestClient.dashboard.mockResolvedValue(placementRequests)

      const result = await service.getDashboard(token, false, 2, 'duration')

      expect(result).toEqual(placementRequests)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.dashboard).toHaveBeenCalledWith(false, 2, 'duration')
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
      placementRequestClient.withdraw.mockResolvedValue()

      const id = 'some-uuid'

      await service.withdraw(token, id)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.withdraw).toHaveBeenCalledWith(id)
    })
  })
})
