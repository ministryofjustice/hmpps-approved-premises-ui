import type { Request, RequestHandler, Response } from 'express'

import PersonService from '../../services/personService'

export default class TimelineController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (_: Request, res: Response) => {
      res.render('people/find', { pageHeading: "Find someone's application history" })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.body

      const timeline = await this.personService.getTimeline(req.user.token, crn)

      res.render('people/timeline/show', { timeline, crn })
    }
  }
}
