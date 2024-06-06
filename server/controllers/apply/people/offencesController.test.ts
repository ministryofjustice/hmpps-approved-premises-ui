import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import { ErrorsAndUserInput } from '@approved-premises/ui'
import OffencesController from './offencesController'
import PersonService from '../../../services/personService'
import { activeOffenceFactory, personFactory, restrictedPersonFactory } from '../../../testutils/factories'
import { isFullPerson } from '../../../utils/personUtils'
import { RestrictedPersonError } from '../../../utils/errors'
import { fetchErrorsAndUserInput } from '../../../utils/validation'

jest.mock('../../../utils/personUtils')
jest.mock('../../../utils/validation')
describe('OffencesController', () => {
  const token = 'SOME_TOKEN'
  const crn = 'some-crn'
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const personService = createMock<PersonService>({})

  let offencesController: OffencesController
  let request: DeepMocked<Request>

  beforeEach(() => {
    jest.resetAllMocks()
    offencesController = new OffencesController(personService)
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
  })
})
