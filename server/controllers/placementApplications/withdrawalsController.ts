import type { Request, RequestHandler, Response } from 'express'

import { PlacementApplicationService } from '../../services'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import applyPaths from '../../paths/apply'
import placementApplicationPaths from '../../paths/placementApplications'

export default class WithdrawlsController {
  constructor(private readonly placementApplicationService: PlacementApplicationService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placementApplication = await this.placementApplicationService.getPlacementApplication(
        req.user.token,
        req.params.id,
      )

      return res.render('placement-applications/withdraw/new', {
        pageHeading: 'Are you sure you want to withdraw this placement application?',
        placementApplicationId: placementApplication.id,
        applicationId: placementApplication.applicationId,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      try {
        await this.placementApplicationService.withdraw(req.user.token, req.params.id)
        const { applicationId } = req.body
        req.flash('success', 'Placement application withdrawn')

        return res.redirect(`${applyPaths.applications.show({ id: applicationId })}?tab=requestAPlacement`)
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          placementApplicationPaths.placementApplications.withdraw.new({ id: req.params.id }),
        )
      }
    }
  }
}
