import type { Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction } from 'express'
import { ApplicationService, BookingService, PlacementService } from '../../services'
import WithdrawablesController from './withdrawablesController'
import { bookingFactory, cas1SpaceBookingFactory, withdrawableFactory } from '../../testutils/factories'
import adminPaths from '../../paths/admin'
import managePaths from '../../paths/manage'
import placementAppPaths from '../../paths/placementApplications'
import { Withdrawable } from '../../@types/shared'
import applyPaths from '../../paths/apply'
import { sortAndFilterWithdrawables } from '../../utils/applications/withdrawables'
import withdrawablesFactory from '../../testutils/factories/withdrawablesFactory'

jest.mock('../../utils/applications/withdrawables')

describe('withdrawablesController', () => {
  const token = 'SOME_TOKEN'
  const applicationId = 'SOME_APP_ID'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()
  const flash = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const bookingService = createMock<BookingService>({})
  const placementService = createMock<PlacementService>({})

  let withdrawablesController: WithdrawablesController

  beforeEach(() => {
    withdrawablesController = new WithdrawablesController(applicationService, bookingService, placementService)
    request = createMock<Request>({ user: { token }, flash })
    response = createMock<Response>({})
    jest.clearAllMocks()
  })

  describe('show', () => {
    describe('Placement requests and applications', () => {
      it(`renders the view passing only the placement request and placement application withdrawables`, async () => {
        const selectedWithdrawableType = 'placementRequest'
        const placementRequestWithdrawable = withdrawableFactory.build({ type: 'placement_request' })
        const placementApplicationWithdrawable = withdrawableFactory.build({ type: 'placement_application' })
        const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
        const withdrawables = [placementRequestWithdrawable, placementApplicationWithdrawable, applicationWithdrawable]
        const withdrawablesWithNotes = withdrawablesFactory.build({ withdrawables })
        ;(sortAndFilterWithdrawables as jest.MockedFunction<typeof sortAndFilterWithdrawables>).mockReturnValue([
          placementRequestWithdrawable,
          placementApplicationWithdrawable,
        ])

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawablesWithNotes)

        const requestHandler = withdrawablesController.show()

        await requestHandler(
          { ...request, params: { id: applicationId }, query: { selectedWithdrawableType } },
          response,
          next,
        )

        expect(sortAndFilterWithdrawables).toHaveBeenCalledWith(withdrawables, [
          'placement_application',
          'placement_request',
        ])
        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/show', {
          pageHeading: 'Select your request',
          id: applicationId,
          withdrawables: [placementRequestWithdrawable, placementApplicationWithdrawable],
          withdrawableType: 'request',
          notes: withdrawablesWithNotes.notes,
        })
      })
    })

    describe('Bookings', () => {
      it(`renders the view, calling the booking service to retrieve bookings`, async () => {
        const selectedWithdrawableType = 'placement'
        const bookingWithdrawables = withdrawableFactory.buildList(2, { type: 'booking' })
        const spaceBookingWithdrawables = withdrawableFactory.buildList(2, { type: 'space_booking' })
        const allPlacementWithdrawables = [...bookingWithdrawables, ...spaceBookingWithdrawables]
        const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
        const bookings = bookingFactory.buildList(2).map((b, i) => {
          return { ...b, id: bookingWithdrawables[i].id }
        })
        const spaceBookings = cas1SpaceBookingFactory.buildList(2).map((b, i) => {
          return { ...b, id: spaceBookingWithdrawables[i].id }
        })
        const withdrawable = [applicationWithdrawable, ...allPlacementWithdrawables]
        const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)
        ;(sortAndFilterWithdrawables as jest.MockedFunction<typeof sortAndFilterWithdrawables>).mockReturnValue(
          allPlacementWithdrawables,
        )
        bookings.forEach(b => bookingService.findWithoutPremises.mockResolvedValueOnce(b))
        spaceBookings.forEach(b => placementService.getPlacement.mockResolvedValueOnce(b))

        const requestHandler = withdrawablesController.show()

        await requestHandler(
          { ...request, params: { id: applicationId }, query: { selectedWithdrawableType } },
          response,
          next,
        )
        expect(sortAndFilterWithdrawables).toHaveBeenCalledWith(withdrawable, ['booking', 'space_booking'])
        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/show', {
          pageHeading: 'Select your placement',
          id: applicationId,
          withdrawables: allPlacementWithdrawables,
          allBookings: [...bookings, ...spaceBookings],
          withdrawableType: 'placement',
          notes: withdrawables.notes,
        })
        expect(bookingService.findWithoutPremises).toHaveBeenCalledTimes(2)
        expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, bookingWithdrawables[0].id)
        expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, bookingWithdrawables[1].id)
        expect(bookingService.findWithoutPremises).not.toHaveBeenCalledWith(token, applicationWithdrawable.id)
        expect(placementService.getPlacement).toHaveBeenCalledTimes(2)
        expect(placementService.getPlacement).toHaveBeenCalledWith(token, spaceBookingWithdrawables[0].id)
        expect(placementService.getPlacement).toHaveBeenCalledWith(token, spaceBookingWithdrawables[1].id)
      })
    })
  })

  describe('create', () => {
    ;[
      {
        type: 'placement_request',
        path: adminPaths.admin.placementRequests.withdrawal.new,
      },
      {
        type: 'placement_application',
        path: placementAppPaths.placementApplications.withdraw.new,
      },
      {
        type: 'application',
        path: applyPaths.applications.withdraw.new,
      },
    ].forEach(w => {
      it(`redirects to the ${w.type} withdrawal page`, async () => {
        const selectedWithdrawable = 'some-id'
        const withdrawable = withdrawableFactory.build({
          type: w.type as Withdrawable['type'],
          id: selectedWithdrawable,
        })
        const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

        const requestHandler = withdrawablesController.create()

        await requestHandler(
          { ...request, params: { id: applicationId }, body: { selectedWithdrawable } },
          response,
          next,
        )
        expect(request.flash).toHaveBeenCalledWith('applicationId', applicationId)
        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.redirect).toHaveBeenCalledWith(302, w.path({ id: selectedWithdrawable }))
      })
    })

    it('redirects to the booking withdrawal page if the withdrawable is a booking', async () => {
      const selectedWithdrawable = 'some-id'
      const withdrawable = withdrawableFactory.build({
        type: 'booking',
        id: selectedWithdrawable,
      })
      const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

      const booking = bookingFactory.build({ id: selectedWithdrawable })

      applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)
      bookingService.findWithoutPremises.mockResolvedValue(booking)

      const requestHandler = withdrawablesController.create()

      await requestHandler(
        { ...request, params: { id: applicationId }, body: { selectedWithdrawable } },
        response,
        next,
      )

      expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
      expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, selectedWithdrawable)
      expect(response.redirect).toHaveBeenCalledWith(
        302,
        managePaths.bookings.cancellations.new({ bookingId: selectedWithdrawable, premisesId: booking.premises.id }),
      )
    })

    it('redirects to the booking withdrawal page if the withdrawable is a space_booking (placement)', async () => {
      const placementId = 'some-id'
      const withdrawable = withdrawableFactory.build({
        type: 'space_booking',
        id: placementId,
      })
      const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

      const placement = cas1SpaceBookingFactory.build({ id: placementId })

      applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)
      placementService.getPlacement.mockResolvedValue(placement)

      const requestHandler = withdrawablesController.create()

      await requestHandler(
        { ...request, params: { id: applicationId }, body: { selectedWithdrawable: placementId } },
        response,
        next,
      )

      expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
      expect(placementService.getPlacement).toHaveBeenCalledWith(token, placementId)
      expect(response.redirect).toHaveBeenCalledWith(
        302,
        managePaths.premises.placements.cancellations.new({ placementId, premisesId: placement.premises.id }),
      )
    })
  })
})
