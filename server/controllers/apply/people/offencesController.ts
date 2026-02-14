import type { Request, RequestHandler, Response } from 'express'

import { ApplicationService, PersonService } from '../../../services'
import { isFullPerson } from '../../../utils/personUtils'
import { RestrictedPersonError } from '../../../utils/errors'
import { fetchErrorsAndUserInput } from '../../../utils/validation'
import paths from '../../../paths/apply'
import { statusesLimitedToOne } from '../../../utils/applications/statusTag'

/** A list of CRNs that skip the 'one application per CRN rule'
 * This is to allow e2e tests to create multiple applications for these CRNs which are needed
 * both for e2e testing and generation og test data for match and manage
 */
const testCrnList = ['X371199']

export default class OffencesController {
  constructor(
    private readonly personService: PersonService,
    private readonly applicationService: ApplicationService,
  ) {}

  selectOffence(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      if (!testCrnList.includes(crn)) {
        const { data: applicationList } = await this.applicationService.getAll(
          req.user.token,
          1,
          undefined,
          undefined,
          {
            crnOrName: crn,
            status: statusesLimitedToOne,
          },
          1,
        )

        if (applicationList.length > 0) return res.redirect(paths.applications.people.manageApplications({ crn }))
      }
      const person = await this.personService.findByCrn(req.user.token, crn)
      if (!isFullPerson(person)) throw new RestrictedPersonError(crn)

      const offences = await this.personService.getOffences(req.user.token, crn)

      return res.render('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        errors,
        errorSummary,
        person,
        offences,
      })
    }
  }
}
