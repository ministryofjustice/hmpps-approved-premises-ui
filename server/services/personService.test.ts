import type { Person } from '@approved-premises/api'

import PersonService from './personService'
import PersonClient from '../data/personClient'
import PersonFactory from '../testutils/factories/person'
import risksFactory from '../testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../utils/utils'
import prisonCaseNotesFactory from '../testutils/factories/prisonCaseNotes'
import adjudicationsFactory from '../testutils/factories/adjudication'

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
      expect(personClient.search).toHaveBeenCalledWith('crn')
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
})
