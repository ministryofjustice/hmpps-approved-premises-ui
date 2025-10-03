import type { Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { NextFunction } from 'express'
import { Withdrawable } from '@approved-premises/api'
import { ApplicationService, PlacementService } from '../../services'
import WithdrawablesController from './withdrawablesController'
import { applicationFactory, cas1SpaceBookingFactory, withdrawableFactory } from '../../testutils/factories'
import adminPaths from '../../paths/admin'
import managePaths from '../../paths/manage'
import placementAppPaths from '../../paths/placementApplications'
import applyPaths from '../../paths/apply'
import { sortAndFilterWithdrawables } from '../../utils/applications/withdrawables'
import withdrawablesFactory from '../../testutils/factories/withdrawablesFactory'
import { applicationKeyDetails } from '../../utils/applications/helpers'

jest.mock('../../utils/applications/withdrawables')

describe('withdrawablesController', () => {
  const token = 'SOME_TOKEN'
  const applicationId = 'SOME_APP_ID'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()
  const flash = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const placementService = createMock<PlacementService>({})

  let withdrawablesController: WithdrawablesController

  const application = applicationFactory.build()

  beforeEach(() => {
    withdrawablesController = new WithdrawablesController(applicationService, placementService)
    request = createMock<Request>({ user: { token }, flash })
    response = createMock<Response>({})
    jest.clearAllMocks()
    applicationService.findApplication.mockResolvedValue(application)
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
        const spaceBookingWithdrawables = withdrawableFactory.buildList(2, { type: 'space_booking' })
        const applicationWithdrawable = withdrawableFactory.build({ type: 'application' })
        const spaceBookings = cas1SpaceBookingFactory
          .buildList(2, { person: application.person, tier: application.risks.tier.value.level })
          .map((b, i) => {
            return { ...b, id: spaceBookingWithdrawables[i].id }
          })
        const withdrawable = [applicationWithdrawable, ...spaceBookingWithdrawables]
        const withdrawables = withdrawablesFactory.build({ withdrawables: withdrawable })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)
        ;(sortAndFilterWithdrawables as jest.MockedFunction<typeof sortAndFilterWithdrawables>).mockReturnValue(
          spaceBookingWithdrawables,
        )
        spaceBookings.forEach(b => placementService.getPlacement.mockResolvedValueOnce(b))

        await withdrawablesController.show()(
          { ...request, params: { id: applicationId }, query: { selectedWithdrawableType } },
          response,
          next,
        )
        expect(sortAndFilterWithdrawables).toHaveBeenCalledWith(withdrawable, ['space_booking'])
        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.render).toHaveBeenCalledWith('applications/withdrawables/show', {
          pageHeading: 'Select placement to withdraw',
          id: applicationId,
          withdrawables: spaceBookingWithdrawables,
          allBookings: spaceBookings,
          withdrawableType: 'placement',
          notes: withdrawables.notes,
          contextKeyDetails: applicationKeyDetails(application),
        })
        expect(placementService.getPlacement).toHaveBeenCalledTimes(2)
        expect(placementService.getPlacement).toHaveBeenCalledWith(token, spaceBookingWithdrawables[0].id)
        expect(placementService.getPlacement).toHaveBeenCalledWith(token, spaceBookingWithdrawables[1].id)
      })
    })
  })

  describe('create', () => {
    const selectedWithdrawableId = 'some-id'
    ;[
      {
        type: 'placement_request',
        path: adminPaths.admin.placementRequests.withdrawal.new({ placementRequestId: selectedWithdrawableId }),
      },
      {
        type: 'placement_application',
        path: placementAppPaths.placementApplications.withdraw.new({ id: selectedWithdrawableId }),
      },
      {
        type: 'application',
        path: applyPaths.applications.withdraw.new({ id: selectedWithdrawableId }),
      },
    ].forEach(w => {
      it(`redirects to the ${w.type} withdrawal page`, async () => {
        const withdrawable = withdrawableFactory.build({
          type: w.type as Withdrawable['type'],
          id: selectedWithdrawableId,
        })
        const withdrawables = withdrawablesFactory.build({ withdrawables: [withdrawable] })

        applicationService.getWithdrawablesWithNotes.mockResolvedValue(withdrawables)

        const requestHandler = withdrawablesController.create()

        await requestHandler(
          { ...request, params: { id: applicationId }, body: { selectedWithdrawable: selectedWithdrawableId } },
          response,
          next,
        )
        expect(request.flash).toHaveBeenCalledWith('applicationId', applicationId)
        expect(applicationService.getWithdrawablesWithNotes).toHaveBeenCalledWith(token, applicationId)
        expect(response.redirect).toHaveBeenCalledWith(302, w.path)
      })
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
