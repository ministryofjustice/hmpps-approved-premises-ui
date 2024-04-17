import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import PersonClient from './personClient'
import config from '../config'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  oasysSectionsFactory,
  oasysSelectionFactory,
  personFactory,
  prisonCaseNotesFactory,
  risksFactory,
} from '../testutils/factories'
import paths from '../paths/api'

import describeClient from '../testutils/describeClient'
import { normaliseCrn } from '../utils/normaliseCrn'

describeClient('PersonClient', provider => {
  let personClient: PersonClient

  const token = 'token-1'

  beforeEach(() => {
    config.flags.oasysDisabled = false
    personClient = new PersonClient(token)
  })

  describe('search', () => {
    it('should return a person', async () => {
      const person = personFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to search for a person',
        withRequest: {
          method: 'GET',
          path: `/people/search`,
          query: {
            crn: normaliseCrn('crn'),
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: person,
        },
      })

      const result = await personClient.search('crn', false)

      expect(result).toEqual(person)
    })

    it('should return append checkCaseload if checkCaseload is true', async () => {
      const person = personFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to search for a person and check the caseload',
        withRequest: {
          method: 'GET',
          path: `/people/search`,
          query: {
            crn: normaliseCrn('crn'),
            checkCaseload: 'true',
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: person,
        },
      })

      const result = await personClient.search('crn', true)

      expect(result).toEqual(person)
    })
  })

  describe('risks', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const risks = risksFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the risks for a person',
        withRequest: {
          method: 'GET',
          path: `/people/${crn}/risks`,
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: risks,
        },
      })

      const result = await personClient.risks(crn)

      expect(result).toEqual(risks)
    })
  })

  describe('prison case notes', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const prisonCaseNotes = prisonCaseNotesFactory.buildList(3)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the case notes for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.prisonCaseNotes({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: prisonCaseNotes,
        },
      })

      const result = await personClient.prisonCaseNotes(crn)

      expect(result).toEqual(prisonCaseNotes)
    })
  })

  describe('adjudications', () => {
    it('should return the adjudications for a person', async () => {
      const crn = 'crn'
      const adjudications = adjudicationFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the adjudications for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.adjudications({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: adjudications,
        },
      })

      const result = await personClient.adjudications(crn)

      expect(result).toEqual(adjudications)
    })
  })

  describe('acctAlerts', () => {
    it('should return the acctAlerts for a person', async () => {
      const crn = 'crn'
      const acctAlerts = acctAlertFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the acctAlerts for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.acctAlerts({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: acctAlerts,
        },
      })

      const result = await personClient.acctAlerts(crn)

      expect(result).toEqual(acctAlerts)
    })
  })

  describe('oasysSelection', () => {
    it('should return the importable sections of OASys', async () => {
      const crn = 'crn'
      const oasysSections = oasysSelectionFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the importable sections of OASys for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.selection({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: oasysSections,
        },
      })

      const result = await personClient.oasysSelections(crn)

      expect(result).toEqual(oasysSections)
    })
  })

  describe('oasysSection', () => {
    it('should return the sections of OASys when there is optional selected sections', async () => {
      const crn = 'crn'
      const optionalSections = [1, 2, 3]
      const oasysSections = oasysSectionsFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the optional selected sections of OASys for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.sections({ crn }),
          query: {
            'selected-sections': ['1', '2', '3'],
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: oasysSections,
        },
      })

      const result = await personClient.oasysSections(crn, optionalSections)

      expect(result).toEqual(oasysSections)
    })

    it('should return the sections of OASys with no optional selected sections', async () => {
      const crn = 'crn'
      const oasysSections = oasysSectionsFactory.build()

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get sections of OASys for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.sections({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: oasysSections,
        },
      })

      const result = await personClient.oasysSections(crn)

      expect(result).toEqual(oasysSections)
    })
  })

  describe('offences', () => {
    it('should return the offences for a person', async () => {
      const crn = 'crn'
      const offences = activeOffenceFactory.buildList(5)

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get offences for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.offences({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: offences,
        },
      })

      const result = await personClient.offences(crn)

      expect(result).toEqual(offences)
    })
  })

  describe('document', () => {
    it('should pipe the document from the API', async () => {
      const crn = 'crn'
      const documentId = '123'
      const response = createMock<Response>({})

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get offences for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.documents({ crn, documentId }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await personClient.document(crn, documentId, response)
    })
  })

  describe('timeline', () => {
    it('calls the API with CRN', async () => {
      const crn = 'crn'

      provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the timeline for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.timeline({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
        },
      })

      await personClient.timeline(crn)
    })
  })
})
