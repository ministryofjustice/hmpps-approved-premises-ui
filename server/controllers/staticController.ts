import { Request, RequestHandler, Response } from 'express'

export default class StaticController {
  render(template: string): RequestHandler {
    return async (_req: Request, res: Response) => {
      return res.render(`static/${template}.njk`)
    }
  }
}
