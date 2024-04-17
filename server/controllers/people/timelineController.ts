import { type Request, type RequestHandler, type Response } from 'express'

import PersonService from '../../services/personService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/people'

export default class TimelineController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.query as { crn: string | undefined }
      const { errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('people/timeline/find', {
        pageHeading: "Find someone's application history",
        errors: errorSummary.length ? { crn: `No offender with an ID of ${crn} found` } : undefined,
        errorSummary,
        ...userInput,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const crn = req?.query.crn as string | undefined

      const timeline = await this.personService.getTimeline(req.user.token, crn)

      res.render('people/timeline/show', { timeline, crn })
    }
  }
}
