import type { Request, RequestHandler, Response } from 'express'
import { PremisesService } from '../../../services'
import paths from '../../../paths/manage'

export default class LocalRestrictionsController {
  constructor(private readonly premisesService: PremisesService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const premises = await this.premisesService.find(req.user.token, premisesId)

      return res.render('manage/premises/localRestrictions/index', {
        backlink: paths.premises.show({ premisesId: premises.id }),
        premises,
      })
    }
  }
}
