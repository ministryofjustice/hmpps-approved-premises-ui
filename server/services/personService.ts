import type { Response } from 'express'
import type {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1OASysMetadata,
  Cas1PersonalTimeline,
  Licence,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
} from '@approved-premises/api'
import { HttpError } from 'http-errors'
import type { PersonClient, RestClientBuilder } from '../data'

export class OasysNotFoundError extends Error {}

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(token: string, crn: string, checkCaseload = false): Promise<Person> {
    return this.personClientFactory(token).search(crn, checkCaseload)
  }

  async getOffences(token: string, crn: string): Promise<Array<ActiveOffence>> {
    return this.personClientFactory(token).offences(crn)
  }

  async getPrisonCaseNotes(token: string, crn: string): Promise<Array<PrisonCaseNote>> {
    return this.personClientFactory(token).prisonCaseNotes(crn)
  }

  async getAdjudications(token: string, crn: string): Promise<Array<Adjudication>> {
    return this.personClientFactory(token).adjudications(crn)
  }

  async getAcctAlerts(token: string, crn: string): Promise<Array<PersonAcctAlert>> {
    return this.personClientFactory(token).acctAlerts(crn)
  }

  async getOasysMetadata(token: string, crn: string): Promise<Cas1OASysMetadata> {
    const personClient = this.personClientFactory(token)

    try {
      return await personClient.oasysMetadata(crn)
    } catch (error) {
      const knownError = error as HttpError
      if (knownError?.data?.status === 404) {
        throw new OasysNotFoundError(`Oasys record not found for CRN: ${crn}`)
      }
      throw knownError
    }
  }

  async getOasysAnswers(
    token: string,
    crn: string,
    group: Cas1OASysGroupName,
    selectedSections: Array<number> = [],
  ): Promise<Cas1OASysGroup> {
    const personClient = this.personClientFactory(token)
    try {
      return await personClient.oasysAnswers(crn, group, selectedSections)
    } catch (error) {
      if ((error as HttpError)?.data?.status === 404) {
        throw new OasysNotFoundError(`Oasys record not found for CRN: ${crn}`)
      }
      throw error
    }
  }

  async riskProfile(token: string, crn: string): Promise<PersonRisks> {
    return this.personClientFactory(token).riskProfile(crn)
  }

  async getDocument(token: string, crn: string, documentId: string, response: Response): Promise<void> {
    return this.personClientFactory(token).document(crn, documentId, response)
  }

  async getTimeline(token: string, crn: string): Promise<Cas1PersonalTimeline> {
    return this.personClientFactory(token).timeline(crn)
  }

  async licenceDetails(token: string, crn: string): Promise<Licence> {
    return this.personClientFactory(token).licenceDetails(crn)
  }
}
