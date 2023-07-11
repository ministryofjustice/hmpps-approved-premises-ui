import type { Request, RequestHandler, Response } from 'express'

import TasklistService from '../../services/tasklistService'
import ApplicationService from '../../services/applicationService'
import { PersonService } from '../../services'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import Apply from '../../form-pages/apply'
import { firstPageOfApplicationJourney } from '../../utils/applications/utils'
import { getResponses } from '../../utils/applications/getResponses'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class ApplicationsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly personService: PersonService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applications = await this.applicationService.getAllForLoggedInUser(req.user.token)

      res.render('applications/index', { pageHeading: 'Approved Premises applications', applications })
    }
  }

  start(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('applications/start', {
        pageHeading: tasklistPageHeading,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      const taskList = new TasklistService(application)

      if (application.status !== 'inProgress') {
        const referrer = req.headers.referer
        res.render('applications/show', { application, referrer })
      } else {
        res.render('applications/tasklist', { application, taskList })
      }
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
          person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render('applications/new', {
        pageHeading: "Enter the person's CRN",
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
        return res.redirect(paths.applications.people.selectOffence({ crn }))
      }

      const offences = await this.personService.getOffences(req.user.token, crn)
      const indexOffence = offences.find(o => o.offenceId === offenceId)
      const application = await this.applicationService.createApplication(req.user.token, crn, indexOffence)

      req.session.application = application

      return res.redirect(firstPageOfApplicationJourney(application))
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      application.document = getResponses(application)

      if (req.body?.confirmation !== 'submit') {
        const errorMessage = 'You must confirm the information provided is complete, accurate and up to date.'
        const errorObject = { text: errorMessage }

        return res.render('applications/tasklist', {
          application,
          errorSummary: [
            {
              text: errorMessage,
              href: '#confirmation',
            },
          ],
          errorObject,
          pageHeading: tasklistPageHeading,
          sections: Apply.sections,
        })
      }

      await this.applicationService.submit(req.user.token, application)
      return res.render('applications/confirm', { pageHeading: 'Application confirmation' })
    }
  }

  confirmWithdrawal(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      return res.render('applications/withdraw', {
        pageHeading: 'Do you want to withdraw this application?',
        applicationId: req.params.id,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  withdraw(): RequestHandler {
    return async (req: Request, res: Response) => {
      if (!req.body.confirmWithdrawal) {
        addErrorMessageToFlash(req, 'You must confirm if you want to withdraw this application', 'confirmWithdrawal')

        return res.redirect(paths.applications.withdraw.confirm({ id: req.params.id }))
      }

      if (req.body.confirmWithdrawal === 'no') {
        return res.redirect(paths.applications.index({}))
      }

      await this.applicationService.withdraw(req.user.token, req.params.id)

      req.flash('success', 'Application withdrawn')
      return res.redirect(paths.applications.index({}))
    }
  }
}
