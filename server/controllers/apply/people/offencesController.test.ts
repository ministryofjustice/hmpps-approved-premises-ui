import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ErrorsAndUserInput } from '@approved-premises/ui'
import OffencesController from './offencesController'
import PersonService from '../../../services/personService'
import { activeOffenceFactory, personFactory, restrictedPersonFactory } from '../../../testutils/factories'
import { isFullPerson } from '../../../utils/personUtils'
import { RestrictedPersonError } from '../../../utils/errors'
import { fetchErrorsAndUserInput } from '../../../utils/validation'
import { ApplicationService } from '../../../services'
import Cas1ApplicationSummary from '../../../testutils/factories/cas1ApplicationSummary'
import config from '../../../config'
import { statusesLimitedToOne } from '../../../utils/applications/statusTag'

jest.mock('../../../utils/personUtils')
jest.mock('../../../utils/validation')
describe('OffencesController', () => {
  const token = 'SOME_TOKEN'
  const crn = 'some-crn'
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})
  const applicationService = createMock<ApplicationService>({})

  let offencesController: OffencesController
  let request: DeepMocked<Request>

  beforeEach(() => {
    config.flags.oneApplication = false
    jest.resetAllMocks()
    offencesController = new OffencesController(personService, applicationService)
    request = createMock<Request>({
      user: { token },
      params: { crn },
    })
    ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
  })

  describe('selectOffence', () => {
    it('should return the a list of offences for the person', async () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)

      const person = personFactory.build()
      const offences = activeOffenceFactory.buildList(5)

      personService.findByCrn.mockResolvedValue(person)
      personService.getOffences.mockResolvedValue(offences)

      const requestHandler = offencesController.selectOffence()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        errors: {},
        errorSummary: [],
        person,
        offences,
      })

      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(isFullPerson).toHaveBeenCalledWith(person)
    })

    it('should throw an error if the person is restricted', async () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(false)

      const restrictedPerson = restrictedPersonFactory.build()
      personService.findByCrn.mockResolvedValue(restrictedPerson)

      const requestHandler = offencesController.selectOffence()

      expect(async () => requestHandler(request, response, next)).rejects.toThrowError(RestrictedPersonError)
      expect(async () => requestHandler(request, response, next)).rejects.toThrowError(`CRN: ${crn} is restricted`)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
    })

    it('renders the form with errors and user input if an error has been sent to the flash', async () => {
      ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
      const errorsAndUserInput = createMock<ErrorsAndUserInput>()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

      const person = personFactory.build()
      const offences = activeOffenceFactory.buildList(5)

      personService.findByCrn.mockResolvedValue(person)
      personService.getOffences.mockResolvedValue(offences)

      const requestHandler = offencesController.selectOffence()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        errors: errorsAndUserInput.errors,
        errorSummary: errorsAndUserInput.errorSummary,
        person,
        offences,
      })

      expect(personService.findByCrn).toHaveBeenCalledWith(token, crn)
      expect(personService.getOffences).toHaveBeenCalledWith(token, crn)
      expect(isFullPerson).toHaveBeenCalledWith(person)
    })

    describe('interruption page redirection', () => {
      beforeEach(async () => {
        config.flags.oneApplication = true
        ;(isFullPerson as jest.MockedFunction<typeof isFullPerson>).mockReturnValue(true)
        const applications = Cas1ApplicationSummary.buildList(2)
        applicationService.getAll.mockResolvedValue({
          pageNumber: '1',
          totalPages: '1',
          totalResults: '1',
          pageSize: '10',
          data: applications,
        })
        personService.findByCrn.mockResolvedValue(personFactory.build())
        personService.getOffences.mockResolvedValue(activeOffenceFactory.buildList(5))
      })
      it('redirects to the interruption page if a search for applications in a live state, returns any', async () => {
        await offencesController.selectOffence()(request, response, next)

        expect(response.redirect).toHaveBeenCalledWith('/applications/people/some-crn/manage-applications')
        expect(applicationService.getAll).toHaveBeenCalledWith(
          token,
          1,
          undefined,
          undefined,
          { crnOrName: 'some-crn', status: statusesLimitedToOne },
          1,
        )
      })

      it(`doesn't redirect to the interruption page if the list is empty`, async () => {
        applicationService.getAll.mockResolvedValue({
          pageNumber: '1',
          totalPages: '1',
          totalResults: '0',
          pageSize: '10',
          data: [],
        })

        await offencesController.selectOffence()(request, response, next)

        expect(response.redirect).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalled()
        expect(applicationService.getAll).toHaveBeenCalled()
      })

      it(`doesn't redirect to the interruption page if the feature flag is not set`, async () => {
        config.flags.oneApplication = false

        await offencesController.selectOffence()(request, response, next)

        expect(response.redirect).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalled()
        expect(applicationService.getAll).not.toHaveBeenCalled()
      })

      it(`doesn't redirect to the interruption page if the test CRN is used`, async () => {
        request.params = { crn: 'X371199' }

        await offencesController.selectOffence()(request, response, next)

        expect(response.redirect).not.toHaveBeenCalled()
        expect(response.render).toHaveBeenCalled()
        expect(applicationService.getAll).not.toHaveBeenCalled()
      })
    })
  })
})
