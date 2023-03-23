import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BedsController from './bedsController'
import bedSearchResultFactory from '../../testutils/factories/bedSearchResult'
import personFactory from '../../testutils/factories/person'

import { BedService, PersonService } from '../../services'
import bedSearchParametersFactory from '../../testutils/factories/bedSearchParameters'
import { mapApiParamsForUi } from '../../utils/matchUtils'
import { BedSearchParametersUi } from '../../@types/ui'

describe('bedsController', () => {
  const token = 'SOME_TOKEN'
  const bedSearchParameters = bedSearchParametersFactory
    .onCreate(mapApiParamsForUi)
    .build() as unknown as BedSearchParametersUi

  const request: DeepMocked<Request> = createMock<Request>({
    user: { token },
    query: bedSearchParameters as unknown as ParsedQs,
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedService = createMock<BedService>({})
  const personService = createMock<PersonService>({})

  let bedsController: BedsController

  beforeEach(() => {
    jest.resetAllMocks()
    bedsController = new BedsController(bedService, personService)
  })

  describe('search', () => {
    it('should render the beds template', async () => {
      const bedSearchResult = bedSearchResultFactory.build()
      bedService.search.mockResolvedValue(bedSearchResult)

      const person = personFactory.build()
      personService.findByCrn.mockResolvedValue(person)

      const requestHandler = bedsController.search()

      const query = { crn: person.crn, ...(bedSearchParameters as unknown as BedSearchParametersUi) }

      await requestHandler({ ...request, query }, response, next)

      expect(response.render).toHaveBeenCalledWith('match/search', {
        pageHeading: 'Find a bed',
        results: bedSearchResult,
        person,
      })
      expect(bedService.search).toHaveBeenCalledWith(token, bedSearchParameters)
      expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
    })
  })
})
