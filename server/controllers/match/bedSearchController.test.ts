import type { NextFunction, Request, Response } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'

import BedsController from './bedSearchController'
import { bedSearchParametersFactory, bedSearchResultFactory, personFactory } from '../../testutils/factories'

import { BedService, PersonService } from '../../services'
import { mapApiParamsForUi, startDateFromParams } from '../../utils/matchUtils'
import { BedSearchParametersUi } from '../../@types/ui'
import matchPaths from '../../paths/match'
import assessPaths from '../../paths/assess'
import applyPaths from '../../paths/apply'

jest.mock('../../utils/matchUtils')

describe('bedSearchController', () => {
  const token = 'SOME_TOKEN'
  const applicationId = 'applicationId'
  const assessmentId = 'assessmentId'
  const request: DeepMocked<Request> = createMock<Request>({
    user: { token },
    body: {},
    query: { applicationId, assessmentId },
  })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedService = createMock<BedService>({})
  const personService = createMock<PersonService>({})

  let bedsController: BedsController

  const formPath = matchPaths.beds.search({})

  beforeEach(() => {
    jest.resetAllMocks()
    bedsController = new BedsController(bedService, personService)
  })

  describe('search', () => {
    describe('if query params and body params are present', () => {
      it('it should render the search template with body params taking precedence over the query params', async () => {
        const bedSearchResults = bedSearchResultFactory.build()
        bedService.search.mockResolvedValue(bedSearchResults)

        const person = personFactory.build()
        personService.findByCrn.mockResolvedValue(person)

        const bedSearchParameters = bedSearchParametersFactory
          .onCreate(mapApiParamsForUi)
          .build() as unknown as BedSearchParametersUi

        const query = {
          crn: person.crn,
          ...request.query,
          ...bedSearchParameters,
        }
        ;(startDateFromParams as jest.Mock).mockReturnValue(query.startDate)

        const body = { durationDays: '2' }

        const searchParams = { query, body }

        const requestHandler = bedsController.search()

        await requestHandler({ ...request, ...searchParams }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          person,
          formPath,
          applicationPath: applyPaths.applications.show({ id: applicationId }),
          assessmentPath: assessPaths.assessments.show({ id: assessmentId }),
          ...query,
          ...body,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, { ...query, ...body })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
      })
    })

    describe('if only query params are present', () => {
      it('it should render the search template by searching with query params ', async () => {
        const bedSearchResults = bedSearchResultFactory.build()
        bedService.search.mockResolvedValue(bedSearchResults)

        const person = personFactory.build()
        personService.findByCrn.mockResolvedValue(person)

        const query = {
          crn: person.crn,
          ...request.query,
          ...(bedSearchParametersFactory.onCreate(mapApiParamsForUi).build() as unknown as BedSearchParametersUi),
        }
        ;(startDateFromParams as jest.Mock).mockReturnValue(query.startDate)

        const requestHandler = bedsController.search()

        await requestHandler({ ...request, query }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          person,
          formPath,
          applicationPath: applyPaths.applications.show({ id: applicationId }),
          assessmentPath: assessPaths.assessments.show({ id: assessmentId }),
          ...query,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, query)
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
      })
    })

    describe('if only body params are present', () => {
      it('should render the search template and call the service with the body params', async () => {
        const bedSearchResults = bedSearchResultFactory.build()
        bedService.search.mockResolvedValue(bedSearchResults)

        const person = personFactory.build()
        personService.findByCrn.mockResolvedValue(person)

        const requestHandler = bedsController.search()

        const params = {
          query: {},
          body: {
            crn: person.crn,
            applicationId,
            assessmentId,
            ...(bedSearchParametersFactory.onCreate(mapApiParamsForUi).build() as unknown as BedSearchParametersUi),
          },
        }
        ;(startDateFromParams as jest.Mock).mockReturnValue(params.body.startDate)

        await requestHandler({ ...request, ...params }, response, next)

        expect(response.render).toHaveBeenCalledWith('match/search', {
          pageHeading: 'Find a bed',
          bedSearchResults,
          person,
          formPath,
          applicationPath: applyPaths.applications.show({ id: applicationId }),
          assessmentPath: assessPaths.assessments.show({ id: assessmentId }),
          crn: params.body.crn,
          ...params.body,
        })
        expect(bedService.search).toHaveBeenCalledWith(token, { ...params.body, crn: params.body.crn })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
      })
    })
  })
})
