import type { Request, RequestHandler, Response } from 'express'
import { addDays, subDays } from 'date-fns'

import PremisesService from '../../../services/premisesService'
import { DateFormats } from '../../../utils/dateUtils'

export default class PremisesController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const tableRows = await this.premisesService.tableRows(req.user.token)
      return res.render('premises/index', { tableRows })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.user.token, req.params.premisesId)

      return res.render('premises/show', {
        premises,
        bookings: premises.bookings,
      })
    }
  }

  calendar(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.getPremisesDetails(req.user.token, req.params.premisesId)

      const startDate = req.query.startDate ? DateFormats.isoToDateObj(req.query.startDate as string) : new Date()
      const endDate = addDays(startDate, 30)

      const nextDate = DateFormats.dateObjToIsoDate(addDays(startDate, 14))
      const previousDate = DateFormats.dateObjToIsoDate(subDays(startDate, 14))

      const bedOccupancyRangeList = await this.premisesService.getOccupancy(
        req.user.token,
        req.params.premisesId,
        DateFormats.dateObjToIsoDate(startDate),
        DateFormats.dateObjToIsoDate(endDate),
      )

      return res.render('premises/calendar', {
        bedOccupancyRangeList,
        premisesId: req.params.premisesId,
        startDate,
        premises,
        nextDate,
        previousDate,
      })
    }
  }
}
