import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BedsController from './bedsController'
import { bedSearchParametersFactory, bedSearchResultFactory, personFactory } from '../../testutils/factories'

import { BedService, PersonService } from '../../services'
import { mapApiParamsForUi } from '../../utils/matchUtils'
import { BedSearchParametersUi } from '../../@types/ui'

describe('bedsController', () => {
  const token = 'SOME_TOKEN'
  const bedSearchParameters = bedSearchParametersFactory
    .onCreate(mapApiParamsForUi)
    .build() as unknown as BedSearchParametersUi

  const request: DeepMocked<Request> = createMock<Request>({
    user: { token },
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
    describe('if query params are present', () => {
      it('should render the beds template', async () => {
        const bedSearchResults = bedSearchResultFactory.build()
        bedService.search.mockResolvedValue(bedSearchResults)

        const person = personFactory.build()
        personService.findByCrn.mockResolvedValue(person)

        const requestHandler = bedsController.search()

        const query = { crn: person.crn, ...bedSearchParameters }

        await requestHandler({ ...request, query }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          person,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, bedSearchParameters)
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
      })
    })

    describe('if there are no query params', () => {
      it('should render the beds template', async () => {
        const bedSearchResult = bedSearchResultFactory.build()
        bedService.search.mockResolvedValue(bedSearchResult)

        const person = personFactory.build()
        personService.findByCrn.mockResolvedValue(person)

        const requestHandler = bedsController.search()

        await requestHandler({ ...request, query: {} }, response, next)

        expect(response.render).not.toHaveBeenCalled()
        expect(bedService.search).not.toHaveBeenCalled()
      })
    })
  })
})
