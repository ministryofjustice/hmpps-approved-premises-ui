import type { Response } from 'express'
import type {
  ActiveOffence,
  Adjudication,
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1OASysSupportingInformationQuestionMetaData,
  Cas1PersonalTimeline,
  Person,
  PersonAcctAlert,
  PrisonCaseNote,
} from '@approved-premises/api'
import { HttpError } from 'http-errors'
import type { PersonClient, RestClientBuilder } from '../data'

export class OasysNotFoundError extends Error {}

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(token: string, crn: string, checkCaseload = false): Promise<Person> {
    const personClient = this.personClientFactory(token)

    return personClient.search(crn, checkCaseload)
  }

  async getOffences(token: string, crn: string): Promise<Array<ActiveOffence>> {
    const personClient = this.personClientFactory(token)

    const offences = await personClient.offences(crn)
    return offences
  }

  async getPrisonCaseNotes(token: string, crn: string): Promise<Array<PrisonCaseNote>> {
    const personClient = this.personClientFactory(token)

    const prisonCaseNotes = await personClient.prisonCaseNotes(crn)

    return prisonCaseNotes
  }

  async getAdjudications(token: string, crn: string): Promise<Array<Adjudication>> {
    const personClient = this.personClientFactory(token)

    const adjudications = await personClient.adjudications(crn)

    return adjudications
  }

  async getAcctAlerts(token: string, crn: string): Promise<Array<PersonAcctAlert>> {
    const personClient = this.personClientFactory(token)

    const acctAlerts = await personClient.acctAlerts(crn)

    return acctAlerts
  }

  async getOasysMetadata(token: string, crn: string): Promise<Array<Cas1OASysSupportingInformationQuestionMetaData>> {
    const personClient = this.personClientFactory(token)

    try {
      const oasysMetaData = await personClient.oasysMetadata(crn)

      return oasysMetaData
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

  async getDocument(token: string, crn: string, documentId: string, response: Response): Promise<void> {
    const personClient = this.personClientFactory(token)

    return personClient.document(crn, documentId, response)
  }

  async getTimeline(token: string, crn: string): Promise<Cas1PersonalTimeline> {
    const personClient = this.personClientFactory(token)

    return personClient.timeline(crn)
  }
}
