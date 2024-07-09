import type { Request, RequestHandler, Response } from 'express'

import PremisesService from '../../../services/premisesService'
import paths from '../../../paths/manage'

export default class V2BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      let backLink: string

      if (req.headers.referer?.match(/calendar/)) {
        backLink = paths.premises.calendar({ premisesId })
      } else {
        backLink = paths.premises.beds.index({ premisesId })
      }

      const bed = await this.premisesService.getBed(req.user.token, premisesId, req.params.bedId)
      const premises = await this.premisesService.getPremisesDetails(req.user.token, premisesId)

      return res.render('v2Manage/premises/beds/show', {
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        backLink,
      })
    }
  }
}
