import { Request, Response, TypedRequestHandler } from 'express'
import { ApType } from '@approved-premises/api'
import { differenceInDays } from 'date-fns'
import type { ObjectWithDateParts, OccupancyFilterCriteria } from '@approved-premises/ui'
import { PlacementRequestService, PremisesService } from '../../../services'
import {
  occupancySummary,
  occupancyViewLink,
  occupancyViewSummaryListForMatchingDetails,
  placementDates,
  redirectToSpaceBookingsNew,
  validateSpaceBooking,
} from '../../../utils/match'
import { occupancyCalendar } from '../../../utils/match/occupancyCalendar'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../../utils/validation'
import { DateFormats } from '../../../utils/dateUtils'
import { durationSelectOptions, occupancyCriteriaMap } from '../../../utils/match/occupancy'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

interface NewRequest extends Request {
  params: {
    id: string
    premisesId: string
  }
  query: ObjectWithDateParts<'startDate'> & {
    durationDays: string
    apType: ApType
    criteria: Array<OccupancyFilterCriteria> | OccupancyFilterCriteria
  }
}

export default class {
  constructor(
    private readonly placementRequestService: PlacementRequestService,
    private readonly premisesService: PremisesService,
  ) {}

  view(): TypedRequestHandler<Request> {
    return async (req: NewRequest, res: Response) => {
      const { token } = req.user
      const { id, premisesId } = req.params
      const { apType, criteria } = req.query

      let criteriaAsArray: Array<OccupancyFilterCriteria>
      if (criteria) {
        criteriaAsArray = Array.isArray(criteria) ? criteria : [criteria]
      }

      const placementRequest = await this.placementRequestService.getPlacementRequest(token, id)
      const premises = await this.premisesService.find(token, premisesId)

      const startDate =
        DateFormats.dateAndTimeInputsToIsoString(req.query, 'startDate').startDate || placementRequest.expectedArrival
      const durationDays = Number(req.query.durationDays) || placementRequest.duration

      const capacityDates = placementDates(startDate, durationDays)
      const capacity = await this.premisesService.getCapacity(
        token,
        premisesId,
        capacityDates.startDate,
        capacityDates.endDate,
      )
      const matchingDetailsSummaryList = occupancyViewSummaryListForMatchingDetails(premises.bedCount, placementRequest)
      const summary = occupancySummary(capacity.capacity, criteriaAsArray)
      const calendar = occupancyCalendar(capacity.capacity, criteriaAsArray)

      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('match/placementRequests/occupancyView/view', {
        pageHeading: `View spaces in ${premises.name}`,
        placementRequest,
        premises,
        apType,
        startDate,
        ...DateFormats.isoDateToDateInputs(startDate, 'startDate'),
        durationDays,
        durationOptions: durationSelectOptions(durationDays),
        criteriaOptions: convertKeyValuePairToCheckBoxItems(occupancyCriteriaMap, criteriaAsArray),
        matchingDetailsSummaryList,
        summary,
        calendar,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  bookSpace(): TypedRequestHandler<Request> {
    return async (req: Request, res: Response) => {
      const { body } = req
      const errors = validateSpaceBooking(body)
      if (this.hasErrors(errors)) {
        if (errors.arrivalDate) {
          addErrorMessageToFlash(req, errors.arrivalDate, 'arrivalDate')
        }
        if (errors.departureDate) {
          addErrorMessageToFlash(req, errors.departureDate, 'departureDate')
        }
        const { startDate, durationDays, apType } = body
        const redirectUrl = occupancyViewLink({
          placementRequestId: req.params.id,
          premisesId: req.params.premisesId,
          apType,
          startDate,
          durationDays,
        })
        res.redirect(redirectUrl)
      } else {
        const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
          body as ObjectWithDateParts<'arrivalDate'>,
          'arrivalDate',
        )
        const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
          body as ObjectWithDateParts<'departureDate'>,
          'departureDate',
        )
        const redirectUrl = redirectToSpaceBookingsNew({
          placementRequestId: req.params.id,
          premisesName: body.premisesName,
          premisesId: body.premisesId,
          apType: body.apType,
          startDate: arrivalDate,
          durationDays: differenceInDays(
            DateFormats.isoToDateObj(departureDate),
            DateFormats.isoToDateObj(arrivalDate),
          ).toString(),
        })
        res.redirect(redirectUrl)
      }
    }
  }

  hasErrors(errors: Record<string, string>): boolean {
    return errors && Object.keys(errors).length > 0
  }
}
