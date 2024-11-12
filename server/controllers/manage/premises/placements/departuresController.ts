import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewDeparture } from '@approved-premises/api'
import { PlacementService, PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { DateFormats, dateAndTimeInputsAreValidDates, timeIsValid24hrFormat } from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'
import paths from '../../../../paths/manage'

// TODO: update these with actual IDs as saved in DB
export const BREACH_OR_RECALL_REASON_ID = 'breach-or-recall-id'
export const PLANNED_MOVE_ON_REASON_ID = 'planned-move-on-id'

export default class DeparturesController {
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
      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(reason => !reason.parent)

      return res.render('manage/premises/placements/departure/new', {
        placement,
        departureReasons,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  saveNew(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const errors: Record<string, string> = {}

        const { departureTime, reasonId } = req.body
        const { departureDateTime } = DateFormats.dateAndTimeInputsToIsoString(
          {
            ...req.body,
            'departureDateTime-time': departureTime,
          },
          'departureDateTime',
        )

        if (!departureDateTime) {
          errors.departureDateTime = 'You must enter an departure date'
        } else if (!dateAndTimeInputsAreValidDates(req.body, 'departureDateTime')) {
          errors.departureDateTime = 'You must enter a valid departure date'
        }

        if (!departureTime) {
          errors.departureTime = 'You must enter a time of departure'
        } else if (!timeIsValid24hrFormat(departureTime)) {
          errors.departureTime = 'You must enter a valid time of departure in 24hr format'
        }

        if (!reasonId) {
          errors.reasonId = 'You must select a reason'
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }

        const departureData: Partial<Cas1NewDeparture> = {
          departureDateTime,
          reasonId,
        }

        this.placementService.setDepartureSessionData(placementId, req.session, departureData)

        return reasonId === BREACH_OR_RECALL_REASON_ID
          ? res.redirect(
              paths.premises.placements.departure.breachOrRecallReason({
                premisesId,
                placementId,
              }),
            )
          : res.redirect(paths.premises.placements.departure.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.new({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  breachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (
        !departureData?.departureDateTime ||
        !departureData?.reasonId ||
        departureData.reasonId !== BREACH_OR_RECALL_REASON_ID
      ) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const departureReasons = (await this.placementService.getDepartureReasons(token)).filter(
        reason => !!reason.parent,
      )

      return res.render('manage/premises/placements/departure/breach-or-recall', {
        placement,
        departureReasons,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  saveBreachOrRecallReason(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { reasonId } = req.body

        if (!reasonId) {
          throw new ValidationError({ reasonId: 'You must select a reason' })
        }

        const departureData: Partial<Cas1NewDeparture> = {
          reasonId,
        }

        this.placementService.setDepartureSessionData(placementId, req.session, departureData)

        return res.redirect(paths.premises.placements.departure.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.breachOrRecallReason({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  moveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { token } = req.user
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (
        !departureData?.departureDateTime ||
        !departureData?.reasonId ||
        departureData.reasonId !== PLANNED_MOVE_ON_REASON_ID
      ) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      const placement = await this.premisesService.getPlacement({ token, premisesId, placementId })
      const moveOnCategories = await this.placementService.getMoveOnCategories(token)

      return res.render('manage/premises/placements/departure/move-on-category', {
        placement,
        moveOnCategories,
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  saveMoveOnCategory(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      try {
        const { moveOnCategoryId } = req.body

        if (!moveOnCategoryId) {
          throw new ValidationError({ moveOnCategoryId: 'You must select a move on category' })
        }

        const departureData: Partial<Cas1NewDeparture> = {
          moveOnCategoryId,
        }

        this.placementService.setDepartureSessionData(placementId, req.session, departureData)

        return res.redirect(paths.premises.placements.departure.notes({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.moveOnCategory({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }

  notes(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session)

      if (!departureData?.departureDateTime || !departureData?.reasonId) {
        return res.redirect(paths.premises.placements.departure.new({ premisesId, placementId }))
      }

      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)

      return res.render('manage/premises/placements/departure/notes', {
        errors,
        errorSummary,
        errorTitle,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params

      const departureData = this.placementService.getDepartureSessionData(placementId, req.session) as Cas1NewDeparture
      const { notes } = req.body

      try {
        const placementDeparture: Cas1NewDeparture = {
          ...departureData,
          notes,
        }

        await this.placementService.createDeparture(req.user.token, premisesId, placementId, placementDeparture)

        req.flash('success', 'You have recorded this person as departed')
        return res.redirect(paths.premises.placements.show({ premisesId, placementId }))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.departure.notes({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
