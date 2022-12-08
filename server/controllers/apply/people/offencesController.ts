import type { Request, Response, RequestHandler } from 'express'

import { PersonService } from '../../../services'

export default class OffencesController {
  constructor(private readonly personService: PersonService) {}

  selectOffence(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params
      const person = await this.personService.findByCrn(req.user.token, crn)
      const offences = await this.personService.getOffences(req.user.token, crn)

      res.render('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        person,
        offences,
      })
    }
  }
}
