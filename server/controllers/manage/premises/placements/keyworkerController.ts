import { type Request, RequestHandler, type Response } from 'express'
import { StaffMember } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import {
  placementKeyDetails,
  renderKeyworkersSelectOptions,
  renderKeyworkersRadioOptions,
} from '../../../../utils/placements'

export default class KeyworkerController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const [placement, currentKeyworkers] = await Promise.all([
        await this.premisesService.getPlacement({
          token,
          premisesId,
          placementId,
        }),
        await this.premisesService.getCurrentKeyworkers(token, premisesId),
      ])

      return res.render('manage/premises/placements/assignKeyworker/new', {
        placement,
        backlink: managePaths.premises.placements.show({ premisesId, placementId: placement.id }),
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorkerUser?.name || 'Not assigned',
        keyworkersOptions: renderKeyworkersRadioOptions(currentKeyworkers, placement),
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  // TODO: Remove handler when new flow released (APS-2644)
  newDeprecated(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const keyworkers: Array<StaffMember> = await this.premisesService.getKeyworkers(token, premisesId)

      return res.render('manage/premises/placements/keyworker', {
        contextKeyDetails: placementKeyDetails(placement),
        currentKeyworkerName: placement.keyWorkerAllocation?.keyWorker?.name || 'Not assigned',
        keyworkersOptions: renderKeyworkersSelectOptions(keyworkers, placement),
        placement,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  // TODO: Remove handler when new flow released (APS-2644)
  assignDeprecated(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      try {
        const { staffCode } = req.body

        if (!staffCode) {
          throw new ValidationError({
            staffCode: 'You must select a keyworker',
          })
        }

        await this.placementService.assignKeyworker(req.user.token, premisesId, placementId, { staffCode })

        req.flash('success', 'Keyworker assigned')
        return res.redirect(managePaths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.keyworkerDeprecated({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
