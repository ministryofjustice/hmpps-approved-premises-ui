import type { Request, RequestHandler, Response } from 'express'
import { addDays } from 'date-fns'
import { PlacementService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import managePaths from '../../../../paths/manage'
import { ValidationError } from '../../../../utils/errors'
import { dateAndTimeInputsAreValidDates, DateFormats, datetimeIsInThePast } from '../../../../utils/dateUtils'
import MultiPageFormManager from '../../../../utils/multiPageFormManager'

export default class TransfersController {
  formData: MultiPageFormManager<'transfers'>

  constructor(private readonly placementService: PlacementService) {
    this.formData = new MultiPageFormManager('transfers')
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      return res.render('manage/premises/placements/transfers/new', {
        backlink: managePaths.premises.placements.show({ premisesId, placementId }),
        pageHeading: 'Request a transfer',
        placement,
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const errors: Record<string, string> = {}

        const { transferDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'transferDate')

        if (!transferDate) {
          errors.transferDate = 'You must enter a transfer date'
        } else if (!dateAndTimeInputsAreValidDates(req.body, 'transferDate')) {
          errors.transferDate = 'You must enter a valid transfer date'
        } else {
          // TODO: this validation will need to be updated when standard transfers are added.
          const oneWeekAgo = DateFormats.dateObjToIsoDate(addDays(new Date(), -7))
          const tomorrow = DateFormats.dateObjToIsoDate(addDays(new Date(), 1))

          if (datetimeIsInThePast(transferDate, oneWeekAgo) || !datetimeIsInThePast(transferDate, tomorrow)) {
            errors.transferDate = 'The date of transfer must be today or in the last 7 days'
          }
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        this.formData.update(placementId, req.session, req.body)

        return req.session.save(() => {
          res.redirect(managePaths.premises.placements.transfers.emergencyDetails({ premisesId, placementId }))
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          managePaths.premises.placements.transfers.new({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  emergencyDetails(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const placement = await this.placementService.getPlacement(req.user.token, placementId)

      const formData = this.formData.get(placementId, req.session)

      if (!formData) {
        res.redirect(managePaths.premises.placements.transfers.new({ premisesId, placementId }))
      }

      res.render('manage/premises/placements/transfers/emergency-details', {
        backlink: managePaths.premises.placements.transfers.new({ premisesId, placementId }),
        pageHeading: 'Enter the emergency transfer details',
        placement,
        errors,
        errorSummary,
        ...formData,
        ...userInput,
      })
    }
  }
}
