import type { Request, RequestHandler, Response } from 'express'

import type { Cas1NewSpaceBookingCancellation, NewCancellation } from '@approved-premises/api'

import { BookingService, CancellationService, PlacementService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'
import applyPaths from '../../paths/apply'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly bookingService: BookingService,
    private readonly placementService: PlacementService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId, placementId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = bookingId && (await this.bookingService.find(req.user.token, premisesId, bookingId))
      const placement = placementId && (await this.placementService.getPlacement(req.user.token, placementId))

      const cancellationReasons = await this.cancellationService.getCancellationReasons(req.user.token)
      const applicationId: string = booking?.applicationId || placement?.applicationId
      let backLink: string

      if (applicationId) {
        backLink = `${applyPaths.applications.withdrawables.show({ id: applicationId })}?selectedWithdrawableType=placement`
      } else {
        backLink = bookingId
          ? paths.bookings.show({ premisesId, bookingId })
          : paths.premises.placements.show({ premisesId, placementId })
      }
      const consolidatedBooking = {
        id: booking?.id || placement?.id,
        person: booking?.person || placement?.person,
        arrivalDate: booking?.arrivalDate || placement?.canonicalArrivalDate,
        departureDate: booking?.departureDate || placement?.canonicalDepartureDate,
      }
      const formAction = booking
        ? paths.bookings.cancellations.create({ premisesId, bookingId })
        : paths.premises.placements.cancellations.create({ premisesId, placementId })
      res.render('cancellations/new', {
        premisesId,
        booking: consolidatedBooking,
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
      const { premisesId, bookingId, placementId } = req.params

      let date: string

      try {
        date = DateFormats.dateAndTimeInputsToIsoString(req.body, 'date').date
        DateFormats.isoToDateObj(date)
      } catch (error) {
        date = DateFormats.dateObjToIsoDate(new Date())
      }

      const cancellation = {
        ...req.body.cancellation,
        date,
      } as NewCancellation

      const spaceBookingCancellation: Cas1NewSpaceBookingCancellation = {
        occurredAt: date,
        reasonId: cancellation.reason,
        reasonNotes: cancellation.otherReason,
      }

      try {
        if (bookingId) {
          await this.cancellationService.createCancellation(req.user.token, premisesId, bookingId, cancellation)
        }
        if (placementId) {
          await this.placementService.createCancellation(
            req.user.token,
            premisesId,
            placementId,
            spaceBookingCancellation,
          )
        }

        res.render('cancellations/confirm', { pageHeading: 'Booking withdrawn' })
      } catch (error) {
        catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          bookingId
            ? paths.bookings.cancellations.new({
                bookingId,
                premisesId,
              })
            : paths.premises.placements.cancellations.new({ premisesId, placementId }),
        )
      }
    }
  }
}
