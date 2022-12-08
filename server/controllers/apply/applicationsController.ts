import type { Request, Response, RequestHandler } from 'express'
import type { Application } from '@approved-premises/api'

import ApplicationService from '../../services/applicationService'
import { PersonService } from '../../services'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import Apply from '../../form-pages/apply'
import { getResponses } from '../../utils/applicationUtils'

export default class ApplicationsController {
  constructor(private readonly applicationService: ApplicationService, private readonly personService: PersonService) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applicationTableRows = await this.applicationService.dashboardTableRows(req.user.token)

      res.render('applications/list', { pageHeading: 'Approved Premises applications', applicationTableRows })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application: Application = req.session.application
        ? req.session.application
        : await this.applicationService.findApplication(req.user.token, req.params.id)

      const risks = await this.personService.getPersonRisks(req.user.token, application.person.crn)

      res.render('applications/show', { application, risks, sections: Apply.sections })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const crn = crnArr[0]
        const person = await this.personService.findByCrn(req.user.token, crn)
        const offences = await this.personService.getOffences(req.user.token, crn)

        const offenceId = offences.length === 1 ? offences[0].offenceId : null

        return res.render(`applications/people/confirm`, {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        pageHeading: "Enter the individual's CRN",
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn, offenceId } = req.body
      if (!offenceId) {
        res.redirect(paths.applications.people.selectOffence({ crn }))
      } else {
        const offences = await this.personService.getOffences(req.user.token, crn)
        const indexOffence = offences.find(o => o.offenceId === offenceId)

        const application = await this.applicationService.createApplication(req.user.token, crn, indexOffence)
        req.session.application = application

        res.redirect(
          paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
        )
      }
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      application.document = getResponses(application)

      await this.applicationService.submit(req.user.token, application)
      res.render('applications/confirm', { pageHeading: 'Application confirmation' })
    }
  }
}
