import type { Request, RequestHandler, Response } from 'express'

import type { Cas1NewSpaceBookingCancellation } from '@approved-premises/api'

import { CancellationService, PlacementService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { placementKeyDetails, withdrawalMessage, withdrawalSummaryList } from '../../utils/placements'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placement = await this.placementService.getPlacement(req.user.token, placementId)
      const cancellationReasons = await this.cancellationService.getCancellationReasons(req.user.token)

      const applicationId: string = placement?.applicationId
      let backLink: string

      if (applicationId) {
        backLink = `${applyPaths.applications.withdrawables.show({ id: applicationId })}?selectedWithdrawableType=placement`
      } else {
        backLink = paths.premises.placements.show({ premisesId, placementId })
      }

      res.render('cancellations/new', {
        contextKeyDetails: placementKeyDetails(placement),
        summaryList: withdrawalSummaryList(placement),
        backLink,
        formAction: paths.premises.placements.cancellations.create({ premisesId, placementId }),
        cancellationReasons,
        pageHeading: 'Confirm placement to withdraw',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      let date: string

      try {
        date = DateFormats.dateAndTimeInputsToIsoString(req.body, 'date').date
        DateFormats.isoToDateObj(date)
      } catch (error) {
        date = DateFormats.dateObjToIsoDate(new Date())
      }

      const spaceBookingCancellation: Cas1NewSpaceBookingCancellation = {
        occurredAt: date,
        reasonId: req.body.reason,
        reasonNotes: req.body.otherReason,
      }

      try {
        const placement = await this.placementService.getPlacement(req.user.token, placementId)
        await this.placementService.createCancellation(
          req.user.token,
          premisesId,
          placementId,
          spaceBookingCancellation,
        )

        req.flash('success', withdrawalMessage(placement))
        res.redirect(adminPaths.admin.placementRequests.show({ placementRequestId: placement.placementRequestId }))
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.cancellations.new({ premisesId, placementId }),
        )
      }
    }
  }
}
