import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import SpaceBookingsController from './spaceBookingsController'

import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import {
  cas1PremisesSummaryFactory,
  cas1SpaceBookingFactory,
  newSpaceBookingFactory,
  personFactory,
  placementRequestDetailFactory,
  spaceBookingRequirementsFactory,
} from '../../../testutils/factories'
import { filterOutAPTypes, placementDates } from '../../../utils/match'
import paths from '../../../paths/admin'
import { fetchErrorsAndUserInput } from '../../../utils/validation'

jest.mock('../../../utils/validation')
describe('SpaceBookingsController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const placementRequestService = createMock<PlacementRequestService>({})
  const premisesService = createMock<PremisesService>({})
  const spaceService = createMock<SpaceService>({})

  let spaceBookingsController: SpaceBookingsController

  beforeEach(() => {
    jest.resetAllMocks()
    spaceBookingsController = new SpaceBookingsController(placementRequestService, spaceService, premisesService)
  })

  describe('new', () => {
    it('should render the new space booking template', async () => {
      const startDate = '2024-07-26'
      const durationDays = '40'
      const premisesId = 'abc123'

      const person = personFactory.build({ name: 'John Wayne' })
      const placementRequestDetail = placementRequestDetailFactory.build({ person })
      const premises = cas1PremisesSummaryFactory.build({ id: premisesId })

      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: [], errorSummary: {}, userInput: {} })
      placementRequestService.getPlacementRequest.mockResolvedValue(placementRequestDetail)
      premisesService.find.mockResolvedValue(premises)

      const query = {
        startDate,
        durationDays,
        premisesId,
      }

      const params = { id: placementRequestDetail.id }

      const requestHandler = spaceBookingsController.new()
      request.params = params
      request.query = query

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('match/placementRequests/spaceBookings/new', {
        pageHeading: `Book space in ${premises.name}`,
        placementRequest: placementRequestDetail,
        premises,
        startDate,
        durationDays,
        errorSummary: {},
        errors: [],
        dates: placementDates(startDate, durationDays),
        essentialCharacteristics: filterOutAPTypes(placementRequestDetail.essentialCriteria),
        desirableCharacteristics: filterOutAPTypes(placementRequestDetail.desirableCriteria),
      })
      expect(placementRequestService.getPlacementRequest).toHaveBeenCalledWith(token, placementRequestDetail.id)
    })
  })

  describe('create', () => {
    it.each([
      ['empty', { essentialCharacteristics: [] }],
      ['populated', {}],
    ])(
      'should call the createSpaceBooking method on the spaceService and redirect the user to the CRU dashboard with characteristics %1',
      async (text, requirementsOverride) => {
        const personName = 'John Doe'
        const premisesName = 'Hope House'
        const id = 'placement-request-id'
        const requirements = spaceBookingRequirementsFactory.build(requirementsOverride)
        const newSpaceBooking = newSpaceBookingFactory.build({ requirements })
        const spaceBooking = cas1SpaceBookingFactory.build()

        const body = {
          arrivalDate: newSpaceBooking.arrivalDate,
          departureDate: newSpaceBooking.departureDate,
          premisesId: newSpaceBooking.premisesId,
          essentialCharacteristics: newSpaceBooking.requirements.essentialCharacteristics.toString(),
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
      },
    )
  })
})
