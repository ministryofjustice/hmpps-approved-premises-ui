import type { Request, RequestHandler, Response } from 'express'

import PremisesService from '../../../services/premisesService'
import paths from '../../../paths/manage'

export default class BedsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { token },
        params: { premisesId },
      } = req

      const [premises, beds] = await Promise.all([
        this.premisesService.find(token, premisesId),
        this.premisesService.getBeds(token, premisesId),
      ])

      return res.render('manage/premises/beds/index', {
        beds,
        premises,
        pageHeading: 'Manage beds',
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const backLink = paths.premises.beds.index({ premisesId })
      const [premises, bed] = await Promise.all([
        this.premisesService.find(req.user.token, premisesId),
        this.premisesService.getBed(req.user.token, premisesId, req.params.bedId),
      ])

      return res.render('manage/premises/beds/show', {
        bed,
        premises,
        pageHeading: `Bed ${bed.name}`,
        backLink,
      })
    }
  }
}
