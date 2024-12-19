import type { Request, RequestHandler, Response, TypedRequestHandler } from 'express'
import type { Cas1NewSpaceBooking } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SpaceService } from '../../../services'
import { filterOutAPTypes, placementDates } from '../../../utils/match'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { createQueryString } from '../../../utils/utils'

interface NewRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; premisesName: string; premisesId: string }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly spaceService: SpaceService,
    private readonly premisesService: PremisesService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const { startDate, durationDays, premisesId } = req.query
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const premises = await this.premisesService.find(req.user.token, premisesId)

      res.render('match/placementRequests/spaceBookings/new', {
        pageHeading: `Book space in ${premises.name}`,
        placementRequest,
        premises,
        startDate,
        durationDays,
        dates: placementDates(startDate, durationDays),
        essentialCharacteristics: filterOutAPTypes(placementRequest.essentialCriteria),
        desirableCharacteristics: filterOutAPTypes(placementRequest.desirableCriteria),
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        body: { arrivalDate, departureDate, durationDays, premisesId, essentialCharacteristics },
      } = req

      const newSpaceBooking: Cas1NewSpaceBooking = {
        arrivalDate,
        departureDate,
        premisesId,
        requirements: {
          essentialCharacteristics: essentialCharacteristics ? essentialCharacteristics.split(',') : [],
        },
      }
      try {
        await this.spaceService.createSpaceBooking(req.user.token, req.params.id, newSpaceBooking)
        req.flash('success', `Space booked for ${req.body.personName} in ${req.body.premisesName}`)
        return res.redirect(`${paths.admin.cruDashboard.index({})}?status=matched`)
      } catch (error) {
        const queryString = createQueryString({
          startDate: arrivalDate,
          durationDays,
          premisesId,
        })
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          `${matchPaths.v2Match.placementRequests.spaceBookings.new({ id: req.params.id })}?${queryString}`,
        )
      }
    }
  }
}
