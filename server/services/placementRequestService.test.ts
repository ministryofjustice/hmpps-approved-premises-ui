import {
  Cas1ChangeRequestSummary,
  Cas1ChangeRequestType,
  type Cas1NewChangeRequest,
  Cas1PlacementRequestDetail,
  PlacementRequest,
  WithdrawPlacementRequestReason,
} from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import PlacementRequestClient, { DashboardFilters } from '../data/placementRequestClient'
import {
  bookingNotMadeFactory,
  cas1ChangeRequestSummaryFactory,
  cas1NewChangeRequestFactory,
  newPlacementRequestBookingConfirmationFactory,
  paginatedResponseFactory,
  cas1PlacementRequestDetailFactory,
  placementRequestFactory,
  cas1ChangeRequestFactory,
  cas1RejectChangeRequestFactory,
} from '../testutils/factories'
import PlacementRequestService from './placementRequestService'
import { Cas1ReferenceData, PaginatedResponse } from '../@types/ui'
import { Cas1ReferenceDataClient } from '../data'

jest.mock('../data/placementRequestClient.ts')
jest.mock('../data/cas1ReferenceDataClient.ts')

describe('placementRequestService', () => {
  const cas1ReferenceDataClient = new Cas1ReferenceDataClient(null) as jest.Mocked<Cas1ReferenceDataClient>
  const placementRequestClient = new PlacementRequestClient(null) as jest.Mocked<PlacementRequestClient>
  const placementRequestClientFactory = jest.fn()
  const cas1ReferenceDataClientFactory = jest.fn()

  const service = new PlacementRequestService(placementRequestClientFactory, cas1ReferenceDataClientFactory)

  const token = 'SOME_TOKEN'
  const id = 'some-uuid'

  beforeEach(() => {
    jest.resetAllMocks()
    placementRequestClientFactory.mockReturnValue(placementRequestClient)
    cas1ReferenceDataClientFactory.mockReturnValue(cas1ReferenceDataClient)
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
      const placementRequestDetail: Cas1PlacementRequestDetail = cas1PlacementRequestDetailFactory.build()
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
    it('should call the service and return the booking not made object', async () => {
      const bookingNotMade = bookingNotMadeFactory.build()
      placementRequestClient.bookingNotMade.mockResolvedValue(bookingNotMade)

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
    it('should call the service', async () => {
      const placementRequestDetail = cas1PlacementRequestDetailFactory.build()
      placementRequestClient.withdraw.mockResolvedValue(placementRequestDetail)

      const reason: WithdrawPlacementRequestReason = 'AlternativeProvisionIdentified'

      await service.withdraw(token, id, reason)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.withdraw).toHaveBeenCalledWith(id, reason)
    })
  })

  describe('getChangeRequest', () => {
    it('should call the service to retrieve a change request', async () => {
      const changeRequest = cas1ChangeRequestFactory.build()
      const params = { placementRequestId: faker.string.uuid(), changeRequestId: changeRequest.id }

      placementRequestClient.getChangeRequest.mockResolvedValue(changeRequest)

      const result = await service.getChangeRequest(token, params)
      expect(placementRequestClient.getChangeRequest).toHaveBeenCalledWith(params)
      expect(result).toEqual(changeRequest)
    })
  })

  describe('getChangeRequestReasons', () => {
    it('should call the service to retrieve change request reasons', async () => {
      const changeRequestType: Cas1ChangeRequestType = 'placementAppeal'
      const expected: Array<Cas1ReferenceData> = [{ name: 'name', id: 'id', isActive: true }]
      cas1ReferenceDataClient.getReferenceData.mockResolvedValue(expected)

      const response = await service.getChangeRequestReasons(token, changeRequestType)

      expect(response).toEqual(expected)
      expect(cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getReferenceData).toHaveBeenCalledWith(
        `change-request-reasons/${changeRequestType}`,
      )
    })
  })

  describe('getChangeRequestRejectionReasons', () => {
    it('should call the service to retrieve change request rejection reasons for a cr type', async () => {
      const changeRequestType: Cas1ChangeRequestType = 'placementAppeal'
      const expected: Array<Cas1ReferenceData> = [{ name: 'name', id: 'id', isActive: true }]
      cas1ReferenceDataClient.getReferenceData.mockResolvedValue(expected)

      const response = await service.getChangeRequestRejectionReasons(token, changeRequestType)

      expect(response).toEqual(expected)
      expect(cas1ReferenceDataClientFactory).toHaveBeenCalledWith(token)
      expect(cas1ReferenceDataClient.getReferenceData).toHaveBeenCalledWith(
        `change-request-rejection-reasons/${changeRequestType}`,
      )
    })
  })

  describe('createPlacementAppeal', () => {
    it('should call the service to create a placement appeal', async () => {
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({ type: 'placementAppeal' })

      await service.createPlacementAppeal(token, id, newChangeRequest)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.createPlacementAppeal).toHaveBeenCalledWith(id, newChangeRequest)
    })
  })

  describe('getChangeRequests', () => {
    it('should call the service', async () => {
      const paginatedResponse = paginatedResponseFactory.build({
        data: cas1ChangeRequestSummaryFactory.buildList(5),
      }) as PaginatedResponse<Cas1ChangeRequestSummary>

      placementRequestClient.getChangeRequests.mockResolvedValue(paginatedResponse)

      const cruManagementAreaId = 'some-id'
      const page = 3
      const sortBy = 'tier'
      const sortDirection = 'desc'

      await service.getChangeRequests(token, { cruManagementAreaId }, page, sortBy, sortDirection)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.getChangeRequests).toHaveBeenCalledWith(
        { cruManagementAreaId },
        page,
        sortBy,
        sortDirection,
      )
    })
  })

  describe('createPlannedTransfer', () => {
    it('should call the service to create a planned transfer', async () => {
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({ type: 'plannedTransfer' })

      await service.createPlannedTransfer(token, id, newChangeRequest)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.createPlannedTransfer).toHaveBeenCalledWith(id, newChangeRequest)
    })
  })

  describe('createExtension', () => {
    it('should call the service to create a placement extension change request', async () => {
      const newChangeRequest: Cas1NewChangeRequest = cas1NewChangeRequestFactory.build({
        type: 'placementExtension',
      })

      await service.createExtension(token, id, newChangeRequest)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.createExtension).toHaveBeenCalledWith(id, newChangeRequest)
    })
  })

  describe('rejectChangeRequest', () => {
    it('should call the service to reject a change request', async () => {
      const params = {
        placementRequestId: faker.string.uuid(),
        changeRequestId: faker.string.uuid(),
        rejectChangeRequest: cas1RejectChangeRequestFactory.build(),
      }

      await service.rejectChangeRequest(token, params)

      expect(placementRequestClientFactory).toHaveBeenCalledWith(token)
      expect(placementRequestClient.rejectChangeRequest).toHaveBeenCalledWith(params)
    })
  })
})
