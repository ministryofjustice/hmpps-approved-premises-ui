import { type Request, RequestHandler, type Response } from 'express'
import { Cas1AssignKeyWorker, StaffMember } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'

export default class KeyworkerController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const staffList: Array<StaffMember> = await this.premisesService.getStaff(token, premisesId)

      return res.render('manage/premises/placements/keyworker', {
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorker?.name || 'Not assigned',
        staffList,
        placement,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  assign(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      try {
        const { keyworkerId } = req.body

        if (!keyworkerId) {
          throw new ValidationError({
            keyworkerId: 'You must select a keyworker',
          })
        }

        const keyworkerAssignment: Cas1AssignKeyWorker = {
          staffCode: keyworkerId,
        }

        await this.placementService.assignKeyworker(req.user.token, premisesId, placementId, keyworkerAssignment)

        req.flash('success', 'Keyworker assigned')
        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.keyworker({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
