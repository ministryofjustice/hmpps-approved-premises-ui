import type { Request, RequestHandler, Response } from 'express'

import PersonService from '../../services/personService'
import { addErrorMessageToFlash } from '../../utils/validation'
import { isFullPerson } from '../../utils/personUtils'
import { RestrictedPersonError } from '../../utils/errors'
import { crnErrorHandling } from '../../utils/people'
import { isValidCrn } from '../../utils/crn'

export default class PeopleController {
  constructor(private readonly personService: PersonService) {}

  find(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn: postCrn, checkCaseload } = req.body
      const crn = postCrn?.trim().toUpperCase()

      if (!crn) {
        addErrorMessageToFlash(req, 'You must enter a CRN', 'crn')
      } else if (!isValidCrn(crn)) {
        addErrorMessageToFlash(req, 'Enter a CRN in the correct format', 'crn')
      } else {
        try {
          const person = await this.personService.findByCrn(req.user.token, crn, !!checkCaseload)
          req.flash('crn', person.crn)

          if (!isFullPerson(person)) {
            throw new RestrictedPersonError(person.crn)
          }
        } catch (error) {
          crnErrorHandling(req, error, crn)
        }
      }

      res.redirect(req.headers.referer)
    }
  }
}
