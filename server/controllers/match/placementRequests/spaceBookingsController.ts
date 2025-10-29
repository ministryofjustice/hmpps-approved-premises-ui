import type { Request, RequestHandler, Response, TypedRequestHandler } from 'express'
import type { Cas1NewSpaceBooking } from '@approved-premises/api'
import { PlacementRequestService, PremisesService, SpaceSearchService } from '../../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/admin'
import matchPaths from '../../../paths/match'
import {
  creationNotificationBody,
  creationNotificationBodyNewPlacement,
  spaceBookingConfirmationSummaryListRows,
} from '../../../utils/match'
import MultiPageFormManager from '../../../utils/multiPageFormManager'
import { placementRequestKeyDetails } from '../../../utils/placementRequests/utils'

interface NewRequest extends Request {
  params: {
    placementRequestId: string
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
      const { placementRequestId, premisesId } = req.params

      const searchState = this.formData.get(placementRequestId, req.session)

      if (!searchState) {
        return res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      }
      if (!searchState.arrivalDate || !searchState.departureDate) {
        return res.redirect(matchPaths.v2Match.placementRequests.search.occupancy({ placementRequestId, premisesId }))
      }

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, placementRequestId)
      const premises = await this.premisesService.find(token, premisesId)

      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      const submitLink = matchPaths.v2Match.placementRequests.spaceBookings.create({
        placementRequestId,
        premisesId,
      })
      const backLink = matchPaths.v2Match.placementRequests.search.occupancy({
        placementRequestId,
        premisesId,
      })

      const summaryListRows = spaceBookingConfirmationSummaryListRows({
        premises,
        expectedArrivalDate: searchState.arrivalDate,
        expectedDepartureDate: searchState.departureDate,
        criteria: searchState.roomCriteria,
        releaseType: placementRequest.releaseType,
        isWomensApplication: placementRequest.application.isWomensApplication,
        newPlacementReason: searchState.newPlacementReason,
      })

      return res.render('match/placementRequests/spaceBookings/new', {
        backLink,
        submitLink,
        contextKeyDetails: placementRequestKeyDetails(placementRequest),
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
        params: { placementRequestId, premisesId },
        user: { token },
      } = req

      const searchState = this.formData.get(placementRequestId, req.session)

      if (!searchState) {
        return res.redirect(matchPaths.v2Match.placementRequests.search.spaces({ placementRequestId }))
      }

      const newSpaceBooking: Cas1NewSpaceBooking = {
        arrivalDate: searchState.arrivalDate,
        departureDate: searchState.departureDate,
        premisesId,
        characteristics: [...searchState.apCriteria, ...searchState.roomCriteria],
        additionalInformation: searchState.newPlacementReason,
      }

      try {
        const placement = await this.spaceSearchService.createSpaceBooking(token, placementRequestId, newSpaceBooking)
        let redirect = `${paths.admin.cruDashboard.index({})}?status=matched`

        if (searchState.newPlacementReason) {
          req.flash('success', {
            heading: 'Placement created',
            body: creationNotificationBodyNewPlacement(placement),
          })
          redirect = paths.admin.placementRequests.show({ placementRequestId })
        } else {
          const placementRequest = await this.placementRequestService.getPlacementRequest(
            token,
            placement.placementRequestId,
          )
          req.flash('success', {
            heading: `Placement booked for ${placement.person.crn}`,
            body: creationNotificationBody(placement, placementRequest),
          })
        }

        this.formData.remove(placementRequestId, req.session)

        return req.session.save(() => {
          res.redirect(redirect)
        })
      } catch (error) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          error,
          matchPaths.v2Match.placementRequests.spaceBookings.new({ placementRequestId, premisesId }),
        )
      }
    }
  }
}
