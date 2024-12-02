import type { Request, RequestHandler, Response } from 'express'
import { ApplicationService, BookingService, PlacementService } from '../../services'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import placementAppPaths from '../../paths/placementApplications'
import managePaths from '../../paths/manage'
import type { ApprovedPremisesApplication as Application, Withdrawable } from '../../@types/shared'
import { SelectedWithdrawableType, sortAndFilterWithdrawables } from '../../utils/applications/withdrawables'

export default class WithdrawalsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly bookingService: BookingService,
    private readonly placementService: PlacementService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params as { id: Application['id'] | undefined }
      const selectedWithdrawableType = req.query?.selectedWithdrawableType as SelectedWithdrawableType | undefined

      const withdrawables = await this.applicationService.getWithdrawablesWithNotes(req.user.token, id)
      if (selectedWithdrawableType === 'placement') {
        const placementAndBookingWithdrawables = sortAndFilterWithdrawables(withdrawables.withdrawables, [
          'booking',
          'space_booking',
        ])
        const bookingWithdrawables = placementAndBookingWithdrawables.filter(({ type }) => type === 'booking')
        const bookings = await Promise.all(
          bookingWithdrawables.map(async withdrawable => {
            return this.bookingService.findWithoutPremises(req.user.token, withdrawable.id)
          }),
        )
        const spaceBookingWithdrawables = placementAndBookingWithdrawables.filter(
          ({ type }) => type === 'space_booking',
        )
        const placements = await Promise.all(
          spaceBookingWithdrawables.map(async withdrawable => {
            return this.placementService.getPlacement(req.user.token, withdrawable.id)
          }),
        )
        return res.render('applications/withdrawables/show', {
          pageHeading: 'Select your placement',
          id,
          withdrawables: placementAndBookingWithdrawables,
          allBookings: [...bookings, ...placements],
          withdrawableType: 'placement',
          notes: withdrawables.notes,
        })
      }

      return res.render('applications/withdrawables/show', {
        pageHeading: 'Select your request',
        withdrawables: sortAndFilterWithdrawables(withdrawables.withdrawables, [
          'placement_application',
          'placement_request',
        ]),
        id,
        withdrawableType: 'request',
        notes: withdrawables.notes,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { selectedWithdrawable } = req.body as {
        selectedWithdrawable: Withdrawable['id'] | undefined
      }
      const { id } = req.params as { id: Application['id'] | undefined }
      req.flash('applicationId', id)

      const withdrawable = (
        await this.applicationService.getWithdrawablesWithNotes(req.user.token, id)
      ).withdrawables.find(w => w.id === selectedWithdrawable)
      if (!withdrawable) {
        return res.redirect(302, applyPaths.applications.withdraw.new({ id }))
      }

      if (withdrawable.type === 'placement_request') {
        return res.redirect(302, adminPaths.admin.placementRequests.withdrawal.new({ id: selectedWithdrawable }))
      }
      if (withdrawable.type === 'placement_application') {
        return res.redirect(302, placementAppPaths.placementApplications.withdraw.new({ id: selectedWithdrawable }))
      }
      if (withdrawable.type === 'booking') {
        const booking = await this.bookingService.findWithoutPremises(req.user.token, selectedWithdrawable)
        return res.redirect(
          302,
          managePaths.bookings.cancellations.new({ bookingId: booking.id, premisesId: booking.premises.id }),
        )
      }

      if (withdrawable.type === 'space_booking') {
        const placement = await this.placementService.getPlacement(req.user.token, selectedWithdrawable)
        return res.redirect(
          302,
          managePaths.premises.placements.cancellations.new({
            placementId: placement.id,
            premisesId: placement.premises.id,
          }),
        )
      }

      if (withdrawable.type === 'application') {
        return res.redirect(302, applyPaths.applications.withdraw.new({ id: selectedWithdrawable }))
      }

      throw new Error(`Invalid withdrawable type ${withdrawable.type}`)
    }
  }
}
