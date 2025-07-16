import type { Request, RequestHandler, Response } from 'express'

import type { Cas1NewSpaceBookingCancellation, NewCancellation } from '@approved-premises/api'

import { CancellationService, PlacementService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'
import { canonicalDates } from '../../utils/placements'

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
      const placementDates = placement && canonicalDates(placement)
      const booking = {
        id: placement?.id,
        person: placement?.person,
        arrivalDate: placementDates?.arrivalDate,
        departureDate: placementDates?.departureDate,
      }
      const formAction = paths.premises.placements.cancellations.create({ premisesId, placementId })

      res.render('cancellations/new', {
        premisesId,
        booking,
        backLink,
        formAction,
        cancellationReasons,
        pageHeading: 'Confirm withdrawn placement',
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
        await this.placementService.createCancellation(
          req.user.token,
          premisesId,
          placementId,
          spaceBookingCancellation,
        )

        res.render('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
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
