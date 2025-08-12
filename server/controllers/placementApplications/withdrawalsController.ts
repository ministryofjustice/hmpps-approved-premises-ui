import type { Request, RequestHandler, Response } from 'express'

import { Application, PlacementDates, WithdrawPlacementRequestReason } from '@approved-premises/api'
import { PlacementApplicationService } from '../../services'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import placementApplicationPaths from '../../paths/placementApplications'
import { applicationShowPageTab, placementApplicationWithdrawalReasons } from '../../utils/applications/utils'
import { withdrawalMessage } from '../../utils/placementRequests/utils'

export default class WithdrawalsController {
  constructor(private readonly placementApplicationService: PlacementApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placementApplication = await this.placementApplicationService.getPlacementApplication(
        req.user.token,
        req.params.id,
      )

      const withdrawalReasonsRadioItems = placementApplicationWithdrawalReasons(req.session.user)

      return res.render('placement-applications/withdraw/new', {
        pageHeading: 'Why is this request for placement being withdrawn?',
        placementApplicationId: placementApplication.id,
        applicationId: placementApplication.applicationId,
        errors,
        errorSummary,
        withdrawalReasonsRadioItems,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        const { reason, applicationId } = req.body as {
          reason: WithdrawPlacementRequestReason | undefined
          applicationId: Application['id'] | undefined
        }

        const placementApplication = await this.placementApplicationService.withdraw(
          req.user.token,
          req.params.id,
          reason,
        )

        try {
          const placementApplicationDate: PlacementDates = placementApplication.placementDates[0]
          req.flash(
            'success',
            withdrawalMessage(placementApplicationDate.duration, placementApplicationDate.expectedArrival),
          )
        } catch (error) {
          req.flash('success', 'Placement application withdrawn')
        }
        return res.redirect(applicationShowPageTab(applicationId, 'placementRequests'))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          placementApplicationPaths.placementApplications.withdraw.new({ id: req.params.id }),
        )
      }
    }
  }
}
