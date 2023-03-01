import type { Person } from '@approved-premises/api'
import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import PersonService from './personService'
import PersonClient from '../data/personClient'
import PersonFactory from '../testutils/factories/person'
import risksFactory from '../testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../utils/utils'
import prisonCaseNotesFactory from '../testutils/factories/prisonCaseNotes'
import adjudicationsFactory from '../testutils/factories/adjudication'
import activeOffenceFactory from '../testutils/factories/activeOffence'
import oasysSelectionFactory from '../testutils/factories/oasysSelection'
import oasysSectionsFactory from '../testutils/factories/oasysSections'
import acctAlertFactory from '../testutils/factories/acctAlert'

jest.mock('../data/personClient.ts')

describe('PersonService', () => {
  const personClient = new PersonClient(null) as jest.Mocked<PersonClient>
  const personClientFactory = jest.fn()

  const service = new PersonService(personClientFactory)

  const token = 'SOME_TOKEN'

  beforeEach(() => {
    jest.resetAllMocks()
    personClientFactory.mockReturnValue(personClient)
  })

  describe('findByCrn', () => {
    it('on success returns the person given their CRN', async () => {
      const person: Person = PersonFactory.build()
      personClient.search.mockResolvedValue(person)

      const postedPerson = await service.findByCrn(token, 'crn')

      expect(postedPerson).toEqual(person)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.search).toHaveBeenCalledWith('crn', false)
    })

    it('sends the checkCaseload boolean to the client method if set', async () => {
      const person: Person = PersonFactory.build()
      personClient.search.mockResolvedValue(person)

      const postedPerson = await service.findByCrn(token, 'crn', true)

      expect(postedPerson).toEqual(person)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.search).toHaveBeenCalledWith('crn', true)
    })
  })

  describe('getOffences', () => {
    it('on success returns the offences for a person given their CRN', async () => {
      const offences = activeOffenceFactory.buildList(2)
      personClient.offences.mockResolvedValue(offences)

      const result = await service.getOffences(token, 'crn')

      expect(result).toEqual(offences)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.offences).toHaveBeenCalledWith('crn')
    })
  })

  describe('getPersonRisks', () => {
    it("on success returns the person's risks given their CRN", async () => {
      const apiRisks = risksFactory.build()
      const uiRisks = mapApiPersonRisksForUi(apiRisks)
      personClient.risks.mockResolvedValue(apiRisks)

      const postedPerson = await service.getPersonRisks(token, 'crn')

      expect(postedPerson).toEqual(uiRisks)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.risks).toHaveBeenCalledWith('crn')
    })
  })

  describe('getPrisonCaseNotes', () => {
    it("on success returns the person's prison case notes given their CRN", async () => {
      const prisonCaseNotes = prisonCaseNotesFactory.buildList(3)

      personClient.prisonCaseNotes.mockResolvedValue(prisonCaseNotes)

      const servicePrisonCaseNotes = await service.getPrisonCaseNotes(token, 'crn')

      expect(servicePrisonCaseNotes).toEqual(prisonCaseNotes)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.prisonCaseNotes).toHaveBeenCalledWith('crn')
    })
  })

  describe('getAdjudications', () => {
    it("on success returns the person's adjudications notes given their CRN", async () => {
      const adjudications = adjudicationsFactory.buildList(3)

      personClient.adjudications.mockResolvedValue(adjudications)

      const servicePrisonCaseNotes = await service.getAdjudications(token, 'crn')

      expect(servicePrisonCaseNotes).toEqual(adjudications)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.adjudications).toHaveBeenCalledWith('crn')
    })
  })

  describe('getAcctAlerts', () => {
    it("on success returns the person's adjudications notes given their CRN", async () => {
      const acctAlerts = acctAlertFactory.buildList(3)

      personClient.acctAlerts.mockResolvedValue(acctAlerts)

      const serviceAcctAlerts = await service.getAcctAlerts(token, 'crn')

      expect(serviceAcctAlerts).toEqual(acctAlerts)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.acctAlerts).toHaveBeenCalledWith('crn')
    })
  })

  describe('getOasysSelections', () => {
    it("on success returns the person's OASys selections given their CRN", async () => {
      const oasysSelections = oasysSelectionFactory.buildList(3)

      personClient.oasysSelections.mockResolvedValue(oasysSelections)

      const serviceOasysSelections = await service.getOasysSelections(token, 'crn')

      expect(serviceOasysSelections).toEqual(oasysSelections)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.oasysSelections).toHaveBeenCalledWith('crn')
    })
  })

  describe('getOasysSections', () => {
    it("on success returns the person's OASys selections given their CRN", async () => {
      const oasysSections = oasysSectionsFactory.build()

      personClient.oasysSections.mockResolvedValue(oasysSections)

      const serviceOasysSections = await service.getOasysSections(token, 'crn')

      expect(serviceOasysSections).toEqual(oasysSections)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.oasysSections).toHaveBeenCalledWith('crn', [])
    })
  })

  describe('getDocument', () => {
    it('pipes the document to the response', async () => {
      const response = createMock<Response>({})
      await service.getDocument(token, 'crn', 'applicationId', response)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.document).toHaveBeenCalledWith('crn', 'applicationId', response)
    })
  })
})
