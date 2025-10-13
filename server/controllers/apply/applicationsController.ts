import type { Request, RequestHandler, Response } from 'express'

import TasklistService from '../../services/tasklistService'
import ApplicationService from '../../services/applicationService'
import { PersonService, SessionService } from '../../services'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import peoplePaths from '../../paths/people'
import { DateFormats } from '../../utils/dateUtils'
import {
  applicationShowPageTabs,
  applicationsTabs,
  applicationStatusSelectOptions,
  firstPageOfApplicationJourney,
} from '../../utils/applications/utils'
import { getResponses } from '../../utils/applications/getResponses'
import { isFullPerson } from '../../utils/personUtils'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { ApplicationSortField } from '../../@types/shared'
import { ApplicationDashboardSearchOptions } from '../../@types/ui'
import { getSearchOptions } from '../../utils/getSearchOptions'
import { RestrictedPersonError } from '../../utils/errors'
import {
  getApplicationTableHeader,
  getApplicationTableRows,
  statusesLimitedToOne,
} from '../../utils/applications/checkApplications'
import adminPaths from '../../paths/admin'

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class ApplicationsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly personService: PersonService,
    private readonly sessionService: SessionService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const applications = await this.applicationService.getAllForLoggedInUser(req.user.token)

      res.render('applications/index', {
        pageHeading: 'Approved Premises applications',
        applicationTabs: applicationsTabs(applications),
      })
    }
  }

  dashboard(): RequestHandler {
    return async (req: Request, res: Response) => {
      const searchOptions = getSearchOptions<ApplicationDashboardSearchOptions>(req, ['crnOrName', 'status'])

      const paginationDetails = getPaginationDetails<ApplicationSortField>(
        req,
        paths.applications.dashboard({}),
        searchOptions,
      )

      const { pageNumber, hrefPrefix, sortBy } = paginationDetails
      let { sortDirection } = paginationDetails

      if (!sortBy || (sortBy === 'createdAt' && !sortDirection)) {
        sortDirection = 'desc'
      }

      const result = await this.applicationService.getAll(
        req.user.token,
        pageNumber,
        sortBy,
        sortDirection,
        searchOptions,
      )

      res.render('applications/dashboard', {
        pageHeading: 'Approved Premises applications',
        statuses: applicationStatusSelectOptions(searchOptions.status),
        crnOrName: searchOptions.crnOrName,
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
      console.log('Pattern', `${paths.applications.index.pattern}.*hash`)
      const backLink = this.sessionService.getPageBackLink(paths.applications.show.pattern, req, [
        paths.applications.index.pattern,
        paths.applications.dashboard.pattern,
        peoplePaths.timeline.show.pattern,
        paths.applications.people.checkApplications.pattern,
      ])

      const application = await this.applicationService.findApplication(req.user.token, req.params.id)

      const taskList = new TasklistService(application)
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      if (application.status !== 'started') {
        const referrer = req.headers.referer
        const defaultParams = { application, referrer, pageHeading: 'Approved Premises application',backLink }

        if (req.query.tab === applicationShowPageTabs.timeline) {
          const timelineEvents = await this.applicationService.timeline(req.user.token, application.id)

          return res.render('applications/show', { ...defaultParams, timelineEvents, tab: 'timeline' })
        }

        if (req.query.tab === applicationShowPageTabs.placementRequests) {
          const requestsForPlacement = await this.applicationService.getRequestsForPlacement(
            req.user.token,
            application.id,
          )

          return res.render('applications/show', {
            backLink,
            ...defaultParams,
            requestsForPlacement,
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
          const offencesLength = offences.length

          if (offencesLength === 0) {
            const bodyTextParam = 'an Approved Premises application'
            const backTextParam = 'dashboard'
            return res.render(`applications/people/noOffence`, {
              pageHeading: 'There are no offences for this person',
              bodyTextParam,
              backTextParam,
              href: paths.applications.index({}),
            })
          }
          const offenceId = offencesLength === 1 ? offences[0].offenceId : null

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
      }
      const restrictedPerson = req.flash('restrictedPerson')[0]
      return res.render('applications/new', {
        pageHeading: "Enter the person's CRN",
        errors,
        errorSummary,
        ...userInput,
        restrictedPerson,
      })
    }
  }

  checkApplications(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { crn } = req.params

      const { data: applicationList } = await this.applicationService.getAll(req.user.token, 1, undefined, undefined, {
        crnOrName: crn,
        status: statusesLimitedToOne,
      })
      
      if (applicationList.length === 0) return res.redirect(paths.applications.people.selectOffence({ crn }))

      return res.render('applications/checkApplications', {
        pageHeading: `There ${applicationList.length > 1 ? 'are' : 'is'} ${applicationList.length} existing application${applicationList.length > 1 ? 's' : ''} for ${crn}`,
        applicationsHeader: getApplicationTableHeader(),
        applicationsRows: getApplicationTableRows(applicationList),
        applicationCount: applicationList.length,
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
        addErrorMessageToFlash(req, 'You must select the index offence', 'offenceId')
        return res.redirect(paths.applications.people.selectOffence({ crn }))
      }

      const person = await this.personService.findByCrn(req.user.token, crn)
      if (!isFullPerson(person)) throw new RestrictedPersonError(crn)
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
