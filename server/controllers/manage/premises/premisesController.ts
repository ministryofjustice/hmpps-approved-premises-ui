import type { Request, RequestHandler, Response } from 'express'

import { ApArea } from '@approved-premises/api'
import { ApAreaService, PremisesService } from '../../../services'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      return res.render('manage/premises/show', {
        premises,
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const selectedArea = req.body.selectedArea as ApArea['id'] | undefined
      const premisesSummaries = await this.premisesService.getAll(req.user.token, selectedArea)
      const areas = await this.apAreaService.getApAreas(req.user.token)

      return res.render('manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: selectedArea || '',
      })
    }
  }
}
