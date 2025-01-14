import { type Request, type RequestHandler, type Response } from 'express'

import PersonService from '../../services/personService'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/people'
import { crnErrorHandling } from '../../utils/people'
import { isValidCrn } from '../../utils/crn'

export default class TimelineController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const crn = req.query?.crn as string
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
      const crn = req?.query?.crn as string
      const formattedCRN = crn?.trim().toUpperCase()

      if (!formattedCRN) {
        addErrorMessageToFlash({ ...req, body: { crn } } as Request, 'You must enter a CRN', 'crn')
        return res.redirect(paths.timeline.find({}))
      }
      if (!isValidCrn(formattedCRN)) {
        addErrorMessageToFlash({ ...req, body: { crn } } as Request, 'Enter a CRN in the correct format', 'crn')
        return res.redirect(paths.timeline.find({}))
      }

      try {
        const timeline = await this.personService.getTimeline(req.user.token, formattedCRN)
        return res.render('people/timeline/show', { timeline, crn, pageHeading: `Timeline for ${formattedCRN}` })
      } catch (error) {
        crnErrorHandling(req, error, crn)
        return res.redirect(paths.timeline.find({}))
      }
    }
  }
}
