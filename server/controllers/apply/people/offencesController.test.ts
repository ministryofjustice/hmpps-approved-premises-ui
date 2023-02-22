import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import OffencesController from './offencesController'
import PersonService from '../../../services/personService'
import personFactory from '../../../testutils/factories/person'
import activeOffenceFactory from '../../../testutils/factories/activeOffence'

describe('OffencesController', () => {
  const token = 'SOME_TOKEN'

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
      params: { crn: 'some-crn' },
    })
  })

  describe('selectOffence', () => {
    it('should return the a list of offences for the person', async () => {
      const person = personFactory.build()
      const offences = activeOffenceFactory.buildList(5)

      personService.findByCrn.mockResolvedValue(person)
      personService.getOffences.mockResolvedValue(offences)

      const requestHandler = offencesController.selectOffence()

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('applications/people/selectOffence', {
        pageHeading: `Select index offence for ${person.name}`,
        person,
        offences,
      })

      expect(personService.findByCrn).toHaveBeenCalledWith(token, 'some-crn')
      expect(personService.getOffences).toHaveBeenCalledWith(token, 'some-crn')
    })
  })
})
