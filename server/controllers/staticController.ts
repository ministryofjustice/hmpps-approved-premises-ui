import { Request, RequestHandler, Response } from 'express'

export const TECHNICAL_BANNER_VERSION = '12-2-2026'
export const TECHNICAL_BANNER_COOKIE_NAME = 'technical-updates-banner'

export default class StaticController {
  render(template: string): RequestHandler {
    return async (req: Request, res: Response) => {
      let backLink: string
      if (template === 'whatsNew') {
        // Note to potentially to further discuss-improve: For the cookies added for now a maxAge (1 year, although it can be anything really) in order to make the cookie to persist or else it will become browser-session only.
        res.cookie(TECHNICAL_BANNER_COOKIE_NAME, TECHNICAL_BANNER_VERSION, { maxAge: 1000 * 60 * 60 * 24 * 365 })
        backLink = req.headers.referer ? new URL(req.headers.referer).pathname : '/'
      }
      return res.render(`static/${template}.njk`, { backLink })
    }
  }
}
