import nock from 'nock'
import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import PersonClient from './personClient'
import config from '../config'
import riskFactory from '../testutils/factories/risks'
import personFactory from '../testutils/factories/person'
import prisonCaseNotesFactory from '../testutils/factories/prisonCaseNotes'
import paths from '../paths/api'
import adjudicationsFactory from '../testutils/factories/adjudication'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import oasysSectionFactory from '../testutils/factories/oasysSection'

describe('PersonClient', () => {
  let fakeApprovedPremisesApi: nock.Scope
  let personClient: PersonClient

  const token = 'token-1'

  beforeEach(() => {
    config.apis.approvedPremises.url = 'http://localhost:8080'
    fakeApprovedPremisesApi = nock(config.apis.approvedPremises.url)
    personClient = new PersonClient(token)
  })

  afterEach(() => {
    if (!nock.isDone()) {
      nock.cleanAll()
      throw new Error('Not all nock interceptors were used!')
    }
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('search', () => {
    it('should return a person', async () => {
      const person = personFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/search?crn=crn`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, person)

      const result = await personClient.search('crn')

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('risks', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const person = riskFactory.build()

      fakeApprovedPremisesApi
        .get(`/people/${crn}/risks`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, person)

      const result = await personClient.risks(crn)

      expect(result).toEqual(person)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('prison case notes', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const prisonCaseNotes = prisonCaseNotesFactory.build()

      fakeApprovedPremisesApi
        .get(paths.people.prisonCaseNotes({ crn }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, prisonCaseNotes)

      const result = await personClient.prisonCaseNotes(crn)

      expect(result).toEqual(prisonCaseNotes)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('adjudications', () => {
    it('should return the adjudications for a person', async () => {
      const crn = 'crn'
      const adjudications = adjudicationsFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.people.adjudications({ crn }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, adjudications)

      const result = await personClient.adjudications(crn)

      expect(result).toEqual(adjudications)
      expect(nock.isDone()).toBeTruthy()
    })

    describe('oasysSelection', () => {
      it('should return the importable sections of OASys', async () => {
        const crn = 'crn'
        const oasysSections = oasysSectionFactory.buildList(5)

        fakeApprovedPremisesApi
          .get(paths.people.oasys.selection({ crn }))
          .matchHeader('authorization', `Bearer ${token}`)
          .reply(201, oasysSections)

        const result = await personClient.oasysSelections(crn)

        expect(result).toEqual(oasysSections)
        expect(nock.isDone()).toBeTruthy()
      })
    })
  })

  describe('offences', () => {
    it('should return the offences for a person', async () => {
      const crn = 'crn'
      const offences = activeOffenceFactory.buildList(5)

      fakeApprovedPremisesApi
        .get(paths.people.offences({ crn }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, offences)

      const result = await personClient.offences(crn)

      expect(result).toEqual(offences)
      expect(nock.isDone()).toBeTruthy()
    })
  })

  describe('document', () => {
    it('should pipe the document from the API', async () => {
      const crn = 'crn'
      const documentId = '123'
      const response = createMock<Response>({})

      fakeApprovedPremisesApi
        .get(paths.people.documents({ crn, documentId }))
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200)

      await personClient.document(crn, documentId, response)

      expect(nock.isDone()).toBeTruthy()
    })
  })
})
