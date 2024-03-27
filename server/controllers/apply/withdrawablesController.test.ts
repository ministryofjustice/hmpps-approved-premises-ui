import type { Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction } from 'express'
import { ApplicationService, BookingService } from '../../services'
import WithdrawablesController from './withdrawablesController'
import { bookingFactory, withdrawableFactory } from '../../testutils/factories'
import adminPaths from '../../paths/admin'
import managePaths from '../../paths/manage'
import placementAppPaths from '../../paths/placementApplications'
import { Withdrawable } from '../../@types/shared'
import applyPaths from '../../paths/apply'
import { sortAndFilterWithdrawables } from '../../utils/applications/withdrawables'

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

  let withdrawablesController: WithdrawablesController

  beforeEach(() => {
    withdrawablesController = new WithdrawablesController(applicationService, bookingService)
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
        ;(sortAndFilterWithdrawables as jest.MockedFunction<typeof sortAndFilterWithdrawables>).mockReturnValue([
          placementRequestWithdrawable,
          placementApplicationWithdrawable,
        ])

        applicationService.getWithdrawables.mockResolvedValue(withdrawables)

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
        expect(applicationService.getWithdrawables).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/show', {
          pageHeading: 'Select your request',
          id: applicationId,
          withdrawables: [placementRequestWithdrawable, placementApplicationWithdrawable],
          withdrawableType: 'request',
        })
      })
    })

    describe('Bookings', () => {
      it(`renders the view, calling the booking service to retrieve bookings`, async () => {
        const selectedWithdrawableType = 'placement'
        const placementWithdrawables = withdrawableFactory.buildList(2, { type: 'booking' })
        const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
        const bookings = bookingFactory.buildList(2).map((b, i) => {
          return { ...b, id: placementWithdrawables[i].id }
        })
        const withdrawables = [applicationWithdrawable, ...placementWithdrawables]

        applicationService.getWithdrawables.mockResolvedValue(withdrawables)
        ;(sortAndFilterWithdrawables as jest.MockedFunction<typeof sortAndFilterWithdrawables>).mockReturnValue(
          placementWithdrawables,
        )
        bookings.forEach(b => bookingService.findWithoutPremises.mockResolvedValueOnce(b))

        const requestHandler = withdrawablesController.show()

        await requestHandler(
          { ...request, params: { id: applicationId }, query: { selectedWithdrawableType } },
          response,
          next,
        )
        expect(sortAndFilterWithdrawables).toHaveBeenCalledWith(withdrawables, ['booking'])
        expect(applicationService.getWithdrawables).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/show', {
          pageHeading: 'Select your placement',
          id: applicationId,
          withdrawables: placementWithdrawables,
          bookings,
          withdrawableType: 'placement',
        })
        expect(bookingService.findWithoutPremises).toHaveBeenCalledTimes(2)
        expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, placementWithdrawables[0].id)
        expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, placementWithdrawables[1].id)
        expect(bookingService.findWithoutPremises).not.toHaveBeenCalledWith(token, applicationWithdrawable.id)
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

        applicationService.getWithdrawables.mockResolvedValue([withdrawable])

        const requestHandler = withdrawablesController.create()

        await requestHandler(
          { ...request, params: { id: applicationId }, body: { selectedWithdrawable } },
          response,
          next,
        )
        expect(request.flash).toHaveBeenCalledWith('applicationId', applicationId)
        expect(applicationService.getWithdrawables).toHaveBeenCalledWith(token, applicationId)
        expect(response.redirect).toHaveBeenCalledWith(302, w.path({ id: selectedWithdrawable }))
      })
    })

    it('redirects to the booking withdrawal page if the withdrawable is a booking', async () => {
      const selectedWithdrawable = 'some-id'
      const withdrawable = withdrawableFactory.build({
        type: 'booking',
        id: selectedWithdrawable,
      })
      const booking = bookingFactory.build({ id: selectedWithdrawable })

      applicationService.getWithdrawables.mockResolvedValue([withdrawable])
      bookingService.findWithoutPremises.mockResolvedValue(booking)

      const requestHandler = withdrawablesController.create()

      await requestHandler(
        { ...request, params: { id: applicationId }, body: { selectedWithdrawable } },
        response,
        next,
      )

      expect(applicationService.getWithdrawables).toHaveBeenCalledWith(token, applicationId)
      expect(bookingService.findWithoutPremises).toHaveBeenCalledWith(token, selectedWithdrawable)
      expect(response.redirect).toHaveBeenCalledWith(
        302,
        managePaths.bookings.cancellations.new({ bookingId: selectedWithdrawable, premisesId: booking.premises.id }),
      )
    })
  })
})
