import { PlacementRequest } from '@approved-premises/api'
import PlacementRequestClient from '../data/placementRequestClient'
import {
  bookingNotMadeFactory,
  newPlacementRequestBookingConfirmationFactory,
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

  describe('getPlacementRequest', () => {
    it('calls the find method on the placementRequest client', async () => {
      const placementRequest: PlacementRequest = placementRequestFactory.build()
      placementRequestClient.find.mockResolvedValue(placementRequest)

      const result = await service.getPlacementRequest(token, placementRequest.id)

      expect(result).toEqual(placementRequest)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.find).toHaveBeenCalledWith(placementRequest.id)
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
})
