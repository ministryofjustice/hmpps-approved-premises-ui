import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from '@approved-premises/ui'
import type { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplicationsController from './applicationsController'
import { ApplicationService, PersonService } from '../../services'
import { fetchErrorsAndUserInput } from '../../utils/validation'
import personFactory from '../../testutils/factories/person'
import applicationFactory from '../../testutils/factories/application'
import risksFactory from '../../testutils/factories/risks'
import activeOffenceFactory from '../../testutils/factories/activeOffence'
import Apply from '../../form-pages/apply'

import paths from '../../paths/apply'
import { DateFormats } from '../../utils/dateUtils'
import { mapApiPersonRisksForUi } from '../../utils/utils'
import { getResponses } from '../../utils/applicationUtils'

jest.mock('../../utils/validation')
jest.mock('../../utils/applicationUtils')

describe('applicationsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  let response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = jest.fn()

  const applicationService = createMock<ApplicationService>({})
  const personService = createMock<PersonService>({})

  let applicationsController: ApplicationsController

  beforeEach(() => {
    applicationsController = new ApplicationsController(applicationService, personService)
    request = createMock<Request>({ user: { token } })
    response = createMock<Response>({})
  })

  describe('index', () => {
    it('renders the index view', async () => {
      const applications = applicationFactory.buildList(5)
      applicationService.getAllForLoggedInUser.mockResolvedValue(applications)

      const requestHandler = applicationsController.index()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/index', {
        pageHeading: 'Approved Premises applications',
        applications,
      })
      expect(applicationService.getAllForLoggedInUser).toHaveBeenCalled()
    })
  })

  describe('start', () => {
    it('renders the start page', () => {
      const requestHandler = applicationsController.start()

      requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/start', {
        pageHeading: 'Apply for an Approved Premises (AP) placement',
      })
    })
  })

  describe('show', () => {
    const application = createMock<ApprovedPremisesApplication>({ person: { crn: 'some-crn' } })
    const risks = mapApiPersonRisksForUi(risksFactory.build())

    beforeEach(() => {
      request = createMock<Request>({
        params: { id: application.id },
        user: {
          token,
        },
      })

      personService.getPersonRisks.mockResolvedValue(risks)
    })

    it('fetches the application from session and renders the task list if an application exists and is in the session', async () => {
      const requestHandler = applicationsController.show()

      request.session.application = application

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/show', {
        application,
        risks,
        sections: Apply.sections,
      })

      expect(personService.getPersonRisks).toHaveBeenCalledWith(token, 'some-crn')
      expect(applicationService.findApplication).not.toHaveBeenCalledWith(token, application.id)
    })

    it('fetches the application from the API and renders the task list if an application exists and is not in the session', async () => {
      const requestHandler = applicationsController.show()

      request.session.application = undefined
      applicationService.findApplication.mockResolvedValue(application)

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/show', {
        application,
        risks,
        sections: Apply.sections,
      })

      expect(personService.getPersonRisks).toHaveBeenCalledWith(token, 'some-crn')
      expect(applicationService.findApplication).toHaveBeenCalledWith(token, application.id)
    })
  })

  describe('new', () => {
    describe('If there is a CRN in the flash', () => {
      const person = personFactory.build()
      const offence = activeOffenceFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([person.crn]),
        })
        personService.findByCrn.mockResolvedValue(person)
        personService.getOffences.mockResolvedValue([offence])
      })

      describe('if an error has not been sent to the flash', () => {
        beforeEach(() => {
          ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
            return { errors: {}, errorSummary: [], userInput: {} }
          })
        })

        it('it should render the start of the application form', async () => {
          const requestHandler = applicationsController.new()

          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
            pageHeading: `Confirm ${person.name}'s details`,
            ...person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            offenceId: offence.offenceId,
            errors: {},
            errorSummary: [],
          })
          expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
          expect(request.flash).toHaveBeenCalledWith('crn')
        })

        it('should not send an offence ID to the view if there are more than one offences returned', async () => {
          const offences = activeOffenceFactory.buildList(2)
          personService.getOffences.mockResolvedValue(offences)

          const requestHandler = applicationsController.new()
          await requestHandler(request, response, next)

          expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
            pageHeading: `Confirm ${person.name}'s details`,
            ...person,
            date: DateFormats.dateObjtoUIDate(new Date()),
            dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
            offenceId: null,
            errors: {},
            errorSummary: [],
          })
        })
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        personService.findByCrn.mockResolvedValue(person)
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/people/confirm', {
          pageHeading: `Confirm ${person.name}'s details`,
          ...person,
          date: DateFormats.dateObjtoUIDate(new Date()),
          dateOfBirth: DateFormats.isoDateToUIDate(person.dateOfBirth, { format: 'short' }),
          offenceId: offence.offenceId,
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
        expect(request.flash).toHaveBeenCalledWith('crn')
      })
    })

    describe('if there isnt a CRN present in the flash', () => {
      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([]),
        })
      })

      it('renders the CRN lookup page', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          pageHeading: "Enter the individual's CRN",
          errors: {},
          errorSummary: [],
        })
      })
      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = applicationsController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('applications/new', {
          pageHeading: "Enter the individual's CRN",
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
      })
    })
  })

  describe('create', () => {
    const application = applicationFactory.build()
    const offences = activeOffenceFactory.buildList(2)

    beforeEach(() => {
      request = createMock<Request>({
        user: { token },
      })
      request.body.crn = 'some-crn'
      request.body.offenceId = offences[0].offenceId

      personService.getOffences.mockResolvedValue(offences)
      applicationService.createApplication.mockResolvedValue(application)
    })

    it('creates an application and redirects to the first page of the first step', async () => {
      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(applicationService.createApplication).toHaveBeenCalledWith('SOME_TOKEN', 'some-crn', offences[0])
      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
      )
    })

    it('redirects to the select offences step if an offence has not been provided', async () => {
      request.body.offenceId = null

      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.applications.people.selectOffence({
          crn: request.body.crn,
        }),
      )
    })

    it('saves the application to the session', async () => {
      const requestHandler = applicationsController.create()

      await requestHandler(request, response, next)

      expect(request.session.application).toEqual(application)
    })
  })

  describe('submit', () => {
    it('calls the application service with the application id', async () => {
      const application = applicationFactory.build()
      application.data = { 'basic-information': { 'sentence-type': '' } }
      applicationService.findApplication.mockResolvedValue(application)

      const requestHandler = applicationsController.submit()

      request.params.id = 'some-id'

      await requestHandler(request, response, next)

      expect(applicationService.findApplication).toHaveBeenCalledWith(token, 'some-id')
      expect(getResponses).toHaveBeenCalledWith(application)
      expect(applicationService.submit).toHaveBeenCalledWith(token, application)
      expect(response.render).toHaveBeenCalledWith('applications/confirm', {
        pageHeading: 'Application confirmation',
      })
    })
  })
})
