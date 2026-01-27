import { type Request, RequestHandler, type Response } from 'express'
import { Cas1NewArrival } from '@approved-premises/api'
import { addDays, isPast, isToday } from 'date-fns'
import { returnPath } from '../../../../utils/resident'
import { PremisesService } from '../../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import PlacementService from '../../../../services/placementService'
import paths from '../../../../paths/manage'
import {
  DateFormats,
  dateAndTimeInputsAreValidDates,
  timeIsValid24hrFormat,
  timeAddLeadingZero,
} from '../../../../utils/dateUtils'
import { ValidationError } from '../../../../utils/errors'
import { hasPermission } from '../../../../utils/users'
import { placementKeyDetails } from '../../../../utils/placements'

export default class ArrivalsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, placementId } = req.params
      const { errors, errorSummary, userInput, errorTitle } = fetchErrorsAndUserInput(req)
      const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

      return res.render('manage/premises/placements/arrival', {
        backlink: returnPath(req, placement),
        contextKeyDetails: placementKeyDetails(placement),
        placement,
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

      try {
        const errors: Record<string, string> = {}

        const { arrivalTime } = req.body

        if (!arrivalTime) {
          errors.arrivalTime = 'You must enter a time of arrival'
        } else if (!timeIsValid24hrFormat(arrivalTime)) {
          errors.arrivalTime = 'You must enter a valid time of arrival in 24-hour format'
        }

        const { arrivalDateTime } = DateFormats.dateAndTimeInputsToIsoString(
          {
            ...req.body,
            'arrivalDateTime-time': arrivalTime,
          },
          'arrivalDateTime',
        )

        if (!arrivalDateTime) {
          errors.arrivalDateTime = 'You must enter an arrival date'
        } else if (!dateAndTimeInputsAreValidDates(req.body, 'arrivalDateTime')) {
          errors.arrivalDateTime = 'You must enter a valid arrival date'
        } else if (!Object.keys(errors).length) {
          if (!isPast(arrivalDateTime)) {
            if (isToday(arrivalDateTime)) {
              errors.arrivalTime = 'The time of arrival must be in the past'
            } else errors.arrivalDateTime = 'The date of arrival must be today or in the past'
          } else if (
            !hasPermission(req.session.user, ['cas1_space_booking_record_arrival_no_date_limit']) &&
            isPast(addDays(arrivalDateTime, 7))
          ) {
            errors.arrivalDateTime = 'The date of arrival cannot be more than 7 days ago'
          }
        }

        if (Object.keys(errors).length) {
          throw new ValidationError(errors)
        }
        const placement = await this.premisesService.getPlacement({ token: req.user.token, premisesId, placementId })

        const placementArrival: Cas1NewArrival = {
          arrivalTime: timeAddLeadingZero(arrivalTime),
          arrivalDate: DateFormats.isoDateTimeToIsoDate(arrivalDateTime),
        }

        await this.placementService.createArrival(req.user.token, premisesId, placementId, placementArrival)

        req.flash('success', 'You have recorded this person as arrived')
        return res.redirect(returnPath(req, placement))
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          paths.premises.placements.arrival({
            premisesId,
            placementId,
          }),
        )
      }
    }
  }
}
