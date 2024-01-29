import type { Request, RequestHandler, Response } from 'express'
import { ApplicationService } from '../../services'
import applyPaths from '../../paths/apply'
import { ApprovedPremisesApplication as Application } from '../../@types/shared'

export default class WithdrawalsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly bookingService: BookingService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { id } = req.params as { id: Application['id'] | undefined }
      const selectedWithdrawableType = req.query?.selectedWithdrawableType as SelectedWithdrawableType | undefined

      const withdrawables = await this.applicationService.getWithdrawables(req.user.token, id)

      if (selectedWithdrawableType === 'booking') {
        const bookings = await Promise.all(
          withdrawables.map(async withdrawable => {
            return this.bookingService.findWithoutPremises(req.user.token, withdrawable.id)
          }),
        )

        return res.render('applications/withdrawables/show', {
          pageHeading: 'Select your booking',
          id,
          selectedWithdrawableType,
          withdrawables,
          bookings,
        })
      }

      return res.render('applications/withdrawables/show', {
        pageHeading: 'Select your placement',
        withdrawables,
        id,
        selectedWithdrawableType,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { selectedWithdrawable } = req.body as {
        selectedWithdrawable: Withdrawable['id'] | undefined
      }
      const { id } = req.params as { id: Application['id'] | undefined }

      const withdrawable = (await this.applicationService.getWithdrawables(req.user.token, id)).find(
        w => w.id === selectedWithdrawable,
      )

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
          managePaths.bookings.cancellations.new({ bookingId: selectedWithdrawable, premisesId: booking.premises.id }),
        )
      }

      throw new Error(`Invalid withdrawable type ${withdrawable.type}`)
    }
  }
}
