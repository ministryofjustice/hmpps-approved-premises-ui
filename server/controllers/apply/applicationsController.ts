import type { Request, RequestHandler, Response } from 'express'

import { addYears } from 'date-fns'
import { ApplicationSortField, Cas1Assessment, Cas1TimelineEvent, RequestForPlacement } from '@approved-premises/api'
import { statusesLimitedToOne } from '../../utils/applications/statusTag'
import {
  getApplicationsHeading,
  getApplicationTableHeader,
  getApplicationTableRows,
} from '../../utils/applications/manageApplications'
import TasklistService from '../../services/tasklistService'
import ApplicationService from '../../services/applicationService'
import { AssessmentService, PersonService, SessionService } from '../../services'
import { addErrorMessageToFlash, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/apply'
import adminPaths from '../../paths/admin'
import { DateFormats } from '../../utils/dateUtils'
import {
  ApplicationShowPageTab,
  applicationsTabs,
  applicationStatusSelectOptions,
  firstPageOfApplicationJourney,
  getApplicationShowPageTabs,
} from '../../utils/applications/utils'
import { getResponses } from '../../utils/applications/getResponses'
import { isFullPerson } from '../../utils/personUtils'
import { getPaginationDetails } from '../../utils/getPaginationDetails'
import { ApplicationDashboardSearchOptions } from '../../@types/ui'
import { getSearchOptions } from '../../utils/getSearchOptions'
import { RestrictedPersonError } from '../../utils/errors'
import peoplePaths from '../../paths/people'
import { applicationKeyDetails, personKeyDetails } from '../../utils/applications/helpers'

interface ShowRequest extends Request {
  query: { tab: ApplicationShowPageTab }
}

export const tasklistPageHeading = 'Apply for an Approved Premises (AP) placement'

export default class ApplicationsController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly assessmentService: AssessmentService,
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
    return async (req: ShowRequest, res: Response) => {
      const application = await this.applicationService.findApplication(req.user.token, req.params.id)

      const backLink = this.sessionService.getPageBackLink(paths.applications.show.pattern, req, [
        paths.applications.index.pattern,
        paths.applications.dashboard.pattern,
        peoplePaths.timeline.show.pattern,
        paths.applications.people.manageApplications.pattern,
        adminPaths.admin.placementRequests.show.pattern,
      ])

      const taskList = new TasklistService(application)
      const { errors, errorSummary } = fetchErrorsAndUserInput(req)

      if (application.status !== 'started') {
        const {
          query: { tab = 'application' },
          user: { token },
          headers: { referer },
        } = req

        const renderParams: {
          timelineEvents?: Array<Cas1TimelineEvent>
          requestsForPlacement?: Array<RequestForPlacement>
          assessment?: Cas1Assessment
        } = {}

        if (tab === 'timeline') {
          renderParams.timelineEvents = await this.applicationService.timeline(token, application.id)
        }
        if (tab === 'placementRequests') {
          renderParams.requestsForPlacement = await this.applicationService.getRequestsForPlacement(
            token,
            application.id,
          )
        }
        if (tab === 'assessment' && application.assessmentId) {
          renderParams.assessment = await this.assessmentService.findAssessment(token, application.assessmentId)
        }

        return res.render('applications/show', {
          backLink,
          contextKeyDetails: applicationKeyDetails(application),
          referrer: referer,
          pageHeading: 'Approved Premises application',
          application,
          ...renderParams,
          tab: tab || 'application',
          tabs: getApplicationShowPageTabs(application.id, tab),
          applicationExpiryDate:
            application.assessmentDecisionDate &&
            DateFormats.dateObjtoUIDate(addYears(application.assessmentDecisionDate, 1)),
        })
      }
      return res.render('applications/tasklist', { application, taskList, errorSummary, errors })
    }
  }

  manageApplications(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { crn } = req.params

      const { data: applicationList } = await this.applicationService.getAll(
        req.user.token,
        1,
        undefined,
        undefined,
        {
          crnOrName: crn,
          status: statusesLimitedToOne,
        },
        1000,
      )

      const person =
        applicationList.length > 0 ? applicationList[0].person : await this.personService.findByCrn(req.user.token, crn)

      return res.render('applications/manageApplications', {
        contextKeyDetails: personKeyDetails(person, applicationList[0] && applicationList[0].risks?.tier?.value?.level),
        continuePath: applicationList.length > 0 ? undefined : paths.applications.people.selectOffence({ crn }),
        pageHeading: getApplicationsHeading(applicationList),
        applicationsHeader: getApplicationTableHeader(),
        applicationsRows: getApplicationTableRows(applicationList, req.session.user.id),
        applicationCount: applicationList.length,
      })
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
