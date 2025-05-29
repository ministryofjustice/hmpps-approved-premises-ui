import type { Request, RequestHandler, Response, TypedRequestHandler } from 'express'
import type { Cas1NewSpaceBooking } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SpaceSearchService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import { creationNotificationBody, spaceBookingConfirmationSummaryListRows } from '../../../utils/match'
import MultiPageFormManager from '../../../utils/multiPageFormManager'

interface NewRequest extends Request {
  params: {
    id: string
    premisesId: string
  }
}

export default class {
  formData: MultiPageFormManager<'spaceSearch'>

  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
    private readonly spaceSearchService: SpaceSearchService,
  ) {
    this.formData = new MultiPageFormManager('spaceSearch')
  }

  new(): TypedRequestHandler<Request, Response> {
    return async (req: NewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params

      const searchState = this.formData.get(id, req.session)

      if (!searchState) {
        return res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ id }))
      }
      if (!searchState.arrivalDate || !searchState.departureDate) {
        return res.redirect(matchPaths.v2Match.placementRequests.search.occupancy({ id, premisesId }))
      }

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const submitLink = matchPaths.v2Match.placementRequests.spaceBookings.create({ id, premisesId })
      const backLink = matchPaths.v2Match.placementRequests.search.occupancy({ id, premisesId })

      const summaryListRows = spaceBookingConfirmationSummaryListRows({
        premises,
        expectedArrivalDate: searchState.arrivalDate,
        expectedDepartureDate: searchState.departureDate,
        criteria: searchState.roomCriteria,
        releaseType: placementRequest.releaseType,
      })

      return res.render('match/placementRequests/spaceBookings/new', {
        backLink,
        submitLink,
        placementRequest,
        premises,
        summaryListRows,
        errors,
        errorSummary,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        params: { id, premisesId },
        user: { token },
      } = req

      const searchState = this.formData.get(id, req.session)

      const newSpaceBooking: Cas1NewSpaceBooking = {
        arrivalDate: searchState.arrivalDate,
        departureDate: searchState.departureDate,
        premisesId,
        characteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
      }

      try {
        const placement = await this.spaceSearchService.createSpaceBooking(token, id, newSpaceBooking)
        const placementRequest = await this.placementRequestService.getPlacementRequest(
          token,
          placement.placementRequestId,
        )
        req.flash('success', {
          heading: `Place booked for ${placement.person.crn}`,
          body: creationNotificationBody(placement, placementRequest),
        })
        this.formData.remove(id, req.session)

        return req.session.save(() => {
          res.redirect(`${paths.admin.cruDashboard.index({})}?status=matched`)
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.spaceBookings.new({ id, premisesId }),
        )
      }
    }
  }
}
