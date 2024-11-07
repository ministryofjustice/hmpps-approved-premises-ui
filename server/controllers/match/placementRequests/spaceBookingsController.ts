import type { Request, RequestHandler, Response, TypedRequestHandler } from 'express'
import { ApType, NewCas1SpaceBooking as NewSpaceBooking } from '@approved-premises/api'
import { PlacementRequestService, SpaceService } from '../../../services'
import { filterOutAPTypes, placementDates } from '../../../utils/match'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'

interface NewRequest extends Request {
  params: { id: string }
  query: { startDate: string; durationDays: string; premisesName: string; premisesId: string; apType: ApType }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly spaceService: SpaceService,
  ) {}

  new(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const placementRequest = await this.placementRequestService.getPlacementRequest(req.user.token, req.params.id)
      const { startDate, durationDays, premisesName, premisesId, apType } = req.query

      res.render('match/placementRequests/spaceBookings/new', {
        pageHeading: `Book space in ${premisesName}`,
        placementRequest,
        premisesName,
        premisesId,
        apType,
        dates: placementDates(startDate, durationDays),
        essentialCharacteristics: filterOutAPTypes(placementRequest.essentialCriteria),
        desirableCharacteristics: filterOutAPTypes(placementRequest.desirableCriteria),
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { body } = req

      const newSpaceBooking: NewSpaceBooking = {
        arrivalDate: body.arrivalDate,
        departureDate: body.departureDate,
        premisesId: body.premisesId,
        requirements: {
          essentialCharacteristics: body.essentialCharacteristics ? body.essentialCharacteristics.split(',') : [],
        },
      }
      try {
        await this.spaceService.createSpaceBooking(req.user.token, req.params.id, newSpaceBooking)
        req.flash('success', `Space booked for ${req.body.personName} in ${req.body.premisesName}`)
        return res.redirect(`${paths.admin.cruDashboard.index({})}?status=matched`)
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error as Error,
          matchPaths.v2Match.placementRequests.spaceBookings.new({ id: req.params.id }),
        )
      }
    }
  }
}
