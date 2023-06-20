import type { Request, RequestHandler, Response } from 'express'
import { addDays } from 'date-fns'

import PremisesService from '../../../services/premisesService'
import BookingService from '../../../services/bookingService'
import { DateFormats } from '../../../utils/dateUtils'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService, private readonly bookingService: BookingService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows(req.user.token)
      return res.render('premises/index', { tableRows })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.user.token, req.params.premisesId)

      const bookings = await this.bookingService.groupedListOfBookingsForPremisesId(
        req.user.token,
        req.params.premisesId,
      )
      const currentResidents = await this.bookingService.currentResidents(req.user.token, req.params.premisesId)
      const overcapacityMessage = await this.premisesService.getOvercapacityMessage(
        req.user.token,
        req.params.premisesId,
      )

      return res.render('premises/show', {
        premises,
        premisesId: req.params.premisesId,
        bookings,
        currentResidents,
        infoMessages: overcapacityMessage,
      })
    }
  }

  calendar(): RequestHandler {
    return async (req: Request, res: Response) => {
      const startDate = new Date()
      const endDate = addDays(new Date(), 30)

      const bedOccupancyRangeList = await this.premisesService.getOccupancy(
        req.user.token,
        req.params.premisesId,
        DateFormats.dateObjToIsoDate(startDate),
        DateFormats.dateObjToIsoDate(endDate),
      )

      return res.render('premises/calendar', { bedOccupancyRangeList, premisesId: req.params.premisesId, startDate })
    }
  }
}
