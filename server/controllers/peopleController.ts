import type { Request, RequestHandler, Response } from 'express'

import PersonService from '../services/personService'
import { addErrorMessageToFlash } from '../utils/validation'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, checkCaseload } = req.body

      if (crn) {
        try {
          const person = await this.personService.findByCrn(req.user.token, crn, !!checkCaseload)
          req.flash('crn', person.crn)
        } catch (err) {
          if ('data' in err && err.status === 404) {
            addErrorMessageToFlash(req, `No person with an CRN of '${crn}' was found`, 'crn')
          } else if (checkCaseload && err.status === 403) {
            addErrorMessageToFlash(req, `The CRN '${crn}' is not in your caseload`, 'crn')
          } else {
            throw err
          }
        }
      } else {
        addErrorMessageToFlash(req, 'You must enter a CRN', 'crn')
      }
      res.redirect(req.headers.referer)
    }
  }
}
