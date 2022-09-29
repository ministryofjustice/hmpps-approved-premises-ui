import type { Response, Request, RequestHandler } from 'express'
import apManagePaths from '../paths/approved-premises/manage'
import taManagePaths from '../paths/temporary-accommodation/manage'
import { getService } from '../utils/applicationUtils'

export default class ApplicationController {
  index(): RequestHandler {
    return (req: Request, res: Response) => {
      const service = getService(req)

      if (service === 'approved-premises') {
        res.redirect(apManagePaths.premises.index({}))
      } else {
        res.redirect(taManagePaths.premises.new({}))
      }
    }
  }
}
