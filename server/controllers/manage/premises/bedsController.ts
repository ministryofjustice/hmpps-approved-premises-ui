import type { Request, RequestHandler, Response } from 'express'

import { decodeOverbooking } from '../../../utils/bedUtils'
import PremisesService from '../../../services/premisesService'
import paths from '../../../paths/manage'

export default class BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const beds = await this.premisesService.getBeds(req.user.token, req.params.premisesId)

      return res.render('premises/beds/index', {
        beds,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage beds',
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      let backLink: string

      if (req.headers.referer?.match(/calendar/)) {
        backLink = paths.premises.calendar({ premisesId: req.params.premisesId })
      } else {
        backLink = paths.premises.beds.index({ premisesId: req.params.premisesId })
      }

      const bed = await this.premisesService.getBed(req.user.token, req.params.premisesId, req.params.bedId)

      return res.render('premises/beds/show', {
        bed,
        premisesId: req.params.premisesId,
        pageHeading: 'Manage beds',
        backLink,
      })
    }
  }

  overbookings(): RequestHandler {
    return async (req: Request, res: Response) => {
      const bed = await this.premisesService.getBed(req.user.token, req.params.premisesId, req.params.bedId)
      const overbooking = decodeOverbooking(req.query.overbooking as string)

      return res.render('premises/beds/overbookings/show', {
        bed,
        premisesId: req.params.premisesId,
        overbooking,
        pageHeading: 'Manage Overbookings',
      })
    }
  }
}
