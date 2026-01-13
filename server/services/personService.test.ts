import { Response } from 'express'
import { createMock } from '@golevelup/ts-jest'
import type { Person } from '@approved-premises/api'

import { when } from 'jest-when'
import { SanitisedError } from '../sanitisedError'
import PersonService, { OasysNotFoundError } from './personService'
import PersonClient from '../data/personClient'
import {
  acctAlertFactory,
  activeOffenceFactory,
  adjudicationFactory,
  cas1SpaceBookingShortSummaryFactory,
  personFactory,
  personalTimelineFactory,
  prisonCaseNotesFactory,
  cas1OasysGroupFactory,
  cas1OASysMetadataFactory,
  risksFactory,
  licenceFactory,
  csraSummaryFactory,
} from '../testutils/factories'

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
      const person: Person = personFactory.build()
      personClient.search.mockResolvedValue(person)

      const postedPerson = await service.findByCrn(token, 'crn')

      expect(postedPerson).toEqual(person)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.search).toHaveBeenCalledWith('crn', false)
    })

    it('sends the checkCaseload boolean to the client method if set', async () => {
      const person: Person = personFactory.build()
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
      const adjudications = adjudicationFactory.buildList(3)

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

  describe('getOasysMetadata', () => {
    it("on success returns the person's OASys metadata given their CRN", async () => {
      const refOasysMetadata = cas1OASysMetadataFactory.build()

      personClient.oasysMetadata.mockResolvedValue(refOasysMetadata)

      const metadata = await service.getOasysMetadata(token, 'crn')

      expect(metadata).toEqual(refOasysMetadata)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.oasysMetadata).toHaveBeenCalledWith('crn')
    })

    it('on 404 it throws an OasysNotFoundError', async () => {
      const err = createMock<SanitisedError>({ data: { status: 404 } })
      personClient.oasysMetadata.mockImplementation(() => {
        throw err
      })

      const t = () => service.getOasysMetadata(token, 'crn')

      await expect(t).rejects.toThrowError(OasysNotFoundError)
      await expect(t).rejects.toThrowError(`Oasys record not found for CRN: crn`)
    })

    it('on 500 it throws the error upstream', async () => {
      const err = createMock<SanitisedError>({ data: { status: 500 } })
      personClient.oasysMetadata.mockImplementation(() => {
        throw err
      })

      try {
        await service.getOasysMetadata(token, 'crn')
      } catch (error) {
        expect(error).toEqual(err)
      }
    })

    it('on generic error it throws the error upstream', async () => {
      const genericError = new Error()
      personClient.oasysMetadata.mockImplementation(() => {
        throw genericError
      })

      await expect(() => service.getOasysMetadata(token, 'crn')).rejects.toThrowError(Error)
    })
  })

  describe('getOasysAnswers', () => {
    const oasysGroup = cas1OasysGroupFactory.build()

    it("on success returns the person's OASys answers given their CRN and groupName", async () => {
      personClient.oasysAnswers.mockResolvedValue(oasysGroup)

      const serviceOasysSections = await service.getOasysAnswers(token, 'crn', oasysGroup.group)

      expect(serviceOasysSections).toEqual(oasysGroup)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.oasysAnswers).toHaveBeenCalledWith('crn', oasysGroup.group, [])
    })

    it('on 404 it throws an OasysNotFoundError', async () => {
      const err = createMock<SanitisedError>({ data: { status: 404 } })
      personClient.oasysAnswers.mockImplementation(() => {
        throw err
      })

      const t = () => service.getOasysAnswers(token, 'crn', oasysGroup.group)

      await expect(t).rejects.toThrowError(OasysNotFoundError)
      await expect(t).rejects.toThrowError(`Oasys record not found for CRN: crn`)
    })

    it('on 500 it throws the error upstream', async () => {
      const err = createMock<SanitisedError>({ data: { status: 500 } })
      personClient.oasysAnswers.mockImplementation(() => {
        throw err
      })

      try {
        await service.getOasysAnswers(token, 'crn', oasysGroup.group)
      } catch (error) {
        expect(error).toEqual(err)
      }
    })

    it('on generic error it throws the error upstream', async () => {
      const genericError = new Error()
      personClient.oasysAnswers.mockImplementation(() => {
        throw genericError
      })

      await expect(() => service.getOasysAnswers(token, 'crn', oasysGroup.group)).rejects.toThrowError(Error)
    })
  })

  describe('getPersonRisks', () => {
    it('returns the risk profile for a person', async () => {
      const personRisks = risksFactory.build()
      personClient.riskProfile.mockResolvedValue(personRisks)

      const result = await service.riskProfile(token, 'crn')

      expect(result).toEqual(personRisks)
      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.riskProfile).toHaveBeenCalledWith('crn')
    })
  })

  describe('licenceDetails', () => {
    it('returns the licence for a person', async () => {
      const licence = licenceFactory.build()
      personClient.licenceDetails.mockResolvedValue(licence)

      const result = await service.licenceDetails(token, 'crn')

      expect(result).toEqual(licence)
      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.licenceDetails).toHaveBeenCalledWith('crn')
    })
  })

  describe('csraSummaries', () => {
    it('returns the CSRA summary list for a person', async () => {
      const csraSummaries = csraSummaryFactory.buildList(2)

      personClient.csraSummaries.mockResolvedValue(csraSummaries)

      const result = await service.csraSummaries(token, 'crn')

      expect(result).toEqual(csraSummaries)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.csraSummaries).toHaveBeenCalledWith('crn')
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

  describe('getTimeline', () => {
    it('calls the client method and retuns the result', async () => {
      const expected = personalTimelineFactory.build()
      const crn = 'crn'
      when(personClient.timeline).calledWith(crn).mockResolvedValue(expected)

      const actual = await service.getTimeline(token, crn)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.timeline).toHaveBeenCalledWith('crn')
      expect(actual).toEqual(expected)
    })
  })

  describe('getSpaceBookings', () => {
    it.each([
      {
        includeCancelledArg: undefined,
        expectedIncludeCancelled: true,
        description: 'includes cancelled bookings by default',
      },
      {
        includeCancelledArg: false,
        expectedIncludeCancelled: false,
        description: 'excludes cancelled bookings when specified',
      },
    ])('$description', async ({ includeCancelledArg, expectedIncludeCancelled }) => {
      const expected = cas1SpaceBookingShortSummaryFactory.buildList(2)
      const crn = 'crn'
      when(personClient.spaceBookings).calledWith(crn, expectedIncludeCancelled).mockResolvedValue(expected)

      const actual = await service.getSpaceBookings(token, crn, includeCancelledArg)

      expect(personClientFactory).toHaveBeenCalledWith(token)
      expect(personClient.spaceBookings).toHaveBeenCalledWith(crn, expectedIncludeCancelled)
      expect(actual).toEqual(expected)
    })
  })
})
