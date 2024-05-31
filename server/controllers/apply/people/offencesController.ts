import type { Request, RequestHandler, Response } from 'express'

import { PersonService } from '../../../services'
import { isFullPerson } from '../../../utils/personUtils'
import { RestrictedPersonError } from '../../../utils/errors'
import { fetchErrorsAndUserInput } from '../../../utils/validation'

export default class OffencesController {
  constructor(private readonly personService: PersonService) {}

  selectOffence(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)
      const person = await this.personService.findByCrn(req.user.token, crn)

      if (!isFullPerson(person)) throw new RestrictedPersonError(crn)

      const offences = await this.personService.getOffences(req.user.token, crn)

      res.render('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        errors,
        errorSummary,
        person,
        offences,
      })
    }
  }
}
