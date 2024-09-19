import type { Request, RequestHandler, Response } from 'express'

import { ApAreaService, PremisesService } from '../../../services'
import { ApArea } from '../../../@types/shared'

export default class V2PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly apAreaService: ApAreaService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const premises = await this.premisesService.find(req.user.token, req.params.premisesId)
      return res.render('v2Manage/premises/show', {
        premises,
      })
    }
  }

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const selectedArea = req.body.selectedArea as ApArea['id'] | undefined
      const premisesSummaries = await this.premisesService.getAll(req.user.token, selectedArea)
      const areas = await this.apAreaService.getApAreas(req.user.token)

      return res.render('v2Manage/premises/index', {
        premisesSummaries,
        areas,
        selectedArea: selectedArea || '',
      })
    }
  }
}
