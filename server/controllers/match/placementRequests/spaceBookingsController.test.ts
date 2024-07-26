import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceBookingsController from './spaceBookingsController'

import { PlacementRequestService, SpaceService } from '../../../services'
import {
  newSpaceBookingFactory,
  personFactory,
  placementRequestDetailFactory,
  spaceBookingFactory,
  spaceBookingRequirementsFactory,
} from '../../../testutils/factories'
import { filterOutAPTypes, placementDates } from '../../../utils/matchUtils'
import paths from '../../../paths/admin'

describe('SpaceBookingsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const spaceService = createMock<SpaceService>({})

  let spaceBookingsController: SpaceBookingsController

  beforeEach(() => {
    jest.resetAllMocks()
    spaceBookingsController = new SpaceBookingsController(placementRequestService, spaceService)
  })

  describe('new', () => {
    it('should render the new space booking template', async () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequestDetail = placementRequestDetailFactory.build({ person })
      const startDate = '2024-07-26'
      const duration = '40'
      const premisesName = 'Hope House'
      const premisesId = 'abc123'
      const apType = 'esap'

      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)

      const query = {
        startDate,
        duration,
        premisesName,
        premisesId,
        apType,
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = spaceBookingsController.new()

      await requestHandler({ ...request, params, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/spaceBookings/new', {
        pageHeading: `Book space in ${premisesName}`,
        placementRequest: placementRequestDetail,
        premisesName,
        premisesId,
        apType,
        dates: placementDates(startDate, duration),
        essentialCharacteristics: filterOutAPTypes(placementRequestDetail.essentialCriteria),
        desirableCharacteristics: filterOutAPTypes(placementRequestDetail.desirableCriteria),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })

  describe('create', () => {
    it('should call the createSpaceBooking method on the spaceService and redirect the user to the CRU dashboard', async () => {
      const personName = 'John Doe'
      const premisesName = 'Hope House'
      const id = 'placement-request-id'
      const requirements = spaceBookingRequirementsFactory.build()
      const newSpaceBooking = newSpaceBookingFactory.build({ placementRequestId: id, requirements })
      const spaceBooking = spaceBookingFactory.build()

      const body = {
        arrivalDate: newSpaceBooking.arrivalDate,
        departureDate: newSpaceBooking.departureDate,
        premisesId: newSpaceBooking.premisesId,
        placementRequestId: id,
        apType: newSpaceBooking.requirements.apType,
        essentialCharacteristics: newSpaceBooking.requirements.essentialCharacteristics.toString(),
        desirableCharacteristics: newSpaceBooking.requirements.desirableCharacteristics.toString(),
        gender: newSpaceBooking.requirements.gender,
        personName,
        premisesName,
      }
      const params = { id }

      spaceService.createSpaceBooking.mockResolvedValue(spaceBooking)
      const flash = jest.fn()

      const requestHandler = spaceBookingsController.create()
      await requestHandler({ ...request, flash, params, body }, response, next)

      expect(spaceService.createSpaceBooking).toHaveBeenCalledWith(token, id, newSpaceBooking)
      expect(flash).toHaveBeenCalledWith('success', `Space booked for ${personName} in ${premisesName}`)
      expect(response.redirect).toHaveBeenCalledWith(`${paths.admin.cruDashboard.index({})}?status=matched`)
    })
  })
})
