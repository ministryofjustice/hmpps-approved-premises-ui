import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import { Cas1OASysGroupName } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import PersonClient from './personClient'
import config from '../config'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  cas1OasysGroupFactory,
  cas1OASysMetadataFactory,
  cas1SpaceBookingShortSummaryFactory,
  personFactory,
  prisonCaseNotesFactory,
} from '../testutils/factories'
import paths from '../paths/api'

import describeClient, { describeCas1NamespaceClient } from '../testutils/describeClient'
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

      await provider.addInteraction({
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

      await provider.addInteraction({
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

  describe('prison case notes', () => {
    it('should return the risks for a person', async () => {
      const crn = 'crn'
      const prisonCaseNotes = prisonCaseNotesFactory.buildList(3)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the case notes for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.prisonCaseNotes({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
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

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the adjudications for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.adjudications({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
            'X-Service-Name': 'approved-premises',
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

      await provider.addInteraction({
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

  describe('offences', () => {
    it('should return the offences for a person', async () => {
      const crn = 'crn'
      const offences = activeOffenceFactory.buildList(5)

      await provider.addInteraction({
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
})

describeCas1NamespaceClient('cas1PersonClient', provider => {
  let personClient: PersonClient

  const token = 'test-token'

  beforeEach(() => {
    personClient = new PersonClient(token)
  })

  describe('oasysMetadata', () => {
    it('should return the importable sections of OASys', async () => {
      const crn = 'crn'
      const oasysMetadata = cas1OASysMetadataFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get the importable sections of OASys for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.metadata({ crn }),
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: oasysMetadata,
        },
      })

      const result = await personClient.oasysMetadata(crn)

      expect(result).toEqual(oasysMetadata)
    })
  })

  describe('oasysAnswers', () => {
    it('should return the OASys questions and answers for a single group', async () => {
      const crn = 'crn'
      const optionalSections = [1, 2, 3]
      const group: Cas1OASysGroupName = faker.helpers.arrayElement(['riskToSelf', 'supportingInformation'])
      const oasysGroup = cas1OasysGroupFactory.build()

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving:
          'A request to get the questions and answers for a single group from OASys including optionals for supporting information',
        withRequest: {
          method: 'GET',
          path: paths.people.oasys.answers({ crn }),
          query: {
            group,
            includeOptionalSections: optionalSections.map(num => num.toString()),
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: oasysGroup,
        },
      })

      const result = await personClient.oasysAnswers(crn, group, optionalSections)

      expect(result).toEqual(oasysGroup)
    })
  })

  describe('timeline', () => {
    it('calls the API with CRN', async () => {
      const crn = 'crn'

      await provider.addInteraction({
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

  describe('spaceBookings', () => {
    it('should return space bookings for a person', async () => {
      const crn = 'crn'
      const includeCancelled = false
      const bookings = cas1SpaceBookingShortSummaryFactory.buildList(3)

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get space bookings for a person',
        withRequest: {
          method: 'GET',
          path: paths.people.spaceBookings({ crn }),
          query: {
            includeCancelled: String(includeCancelled),
          },
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: bookings,
        },
      })

      const result = await personClient.spaceBookings(crn, includeCancelled)

      expect(result).toEqual(bookings)
    })
  })

  describe('document', () => {
    it('should pipe the document from the API', async () => {
      const crn = 'crn'
      const documentId = faker.string.uuid()
      const response = createMock<Response>({})

      await provider.addInteraction({
        state: 'Server is healthy',
        uponReceiving: 'A request to get a document for a person',
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
})
