import type { Request, RequestHandler, Response } from 'express'

import TasklistService from '../../services/tasklistService'
import ApplicationService from '../../services/applicationService'
import { PersonService } from '../../services'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import { firstPageOfApplicationJourney } from '../../utils/applications/utils'
import { getResponses } from '../../utils/applications/getResponses'
import { isFullPerson } from '../../utils/personUtils'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { ActiveOffence, ApplicationSortField } from '../../@types/shared'

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

  dashboard(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { pageNumber, hrefPrefix, sortBy, sortDirection } = getPaginationDetails<ApplicationSortField>(
        req,
        paths.applications.dashboard({}),
      )
      const result = await this.applicationService.dashboard(req.user.token, pageNumber, sortBy, sortDirection)

      res.render('applications/dashboard', {
        pageHeading: 'Approved Premises applications',
        applications: result.data,
        pageNumber: Number(result.pageNumber),
        totalPages: Number(result.totalPages),
        hrefPrefix,
        sortBy,
        sortDirection,
      })
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
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      if (application.status !== 'inProgress') {
        const referrer = req.headers.referer
        const defaultParams = { application, referrer, pageHeading: 'Approved Premises application' }

        if (req.query.tab === 'timeline') {
          const timelineEvents = await this.applicationService.timeline(req.user.token, application.id)

          return res.render('applications/show', { ...defaultParams, timelineEvents, tab: 'timeline' })
        }

        if (req.query.tab === 'placementRequests') {
          const placementApplications = await this.applicationService.getPlacementApplications(
            req.user.token,
            application.id,
          )

          return res.render('applications/show', {
            ...defaultParams,
            placementApplications: placementApplications.sort(
              (a, b) =>
                DateFormats.isoToDateObj(b.submittedAt).getTime() - DateFormats.isoToDateObj(a.submittedAt).getTime(),
            ),
            tab: 'placementRequests',
          })
        }

        return res.render('applications/show', { ...defaultParams, tab: 'application' })
      }
      return res.render('applications/tasklist', { application, taskList, errorSummary, errors })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const crn = crnArr[0]
        const person = await this.personService.findByCrn(req.user.token, crn)

        if (isFullPerson(person)) {
          const offences = await this.personService.getOffences(req.user.token, crn)

          return res.render(`applications/people/confirm`, {
            pageHeading: `Confirm ${person.name}'s details`,
            person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            offences: JSON.stringify(offences),
            errors,
            errorSummary,
            ...userInput,
          })
        }
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
      const { crn } = req.body
      const offences = JSON.parse(req.body.offences) as Array<ActiveOffence>

      if (offences.length > 1) {
        return res.redirect(paths.applications.people.selectOffence({ crn }))
      }

      const { convictionId, deliusEventNumber } = offences[0]

      const application = await this.applicationService.createApplication(
        req.user.token,
        crn,
        convictionId,
        deliusEventNumber,
      )

      req.session.application = application

      return res.redirect(firstPageOfApplicationJourney(application))
    }
  }

  submit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)
      application.document = getResponses(application)

      if (req.body?.confirmation !== 'submit') {
        addErrorMessageToFlash(
          req,
          'You must confirm the information provided is complete, accurate and up to date.',
          'confirmation',
        )
        return res.redirect(paths.applications.show({ id: application.id }))
      }
      await this.applicationService.submit(req.user.token, application)
      return res.render('applications/confirm', { pageHeading: 'Application confirmation' })
    }
  }
}
