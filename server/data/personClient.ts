import type { Response } from 'express'

import type {
  ActiveOffence,
  Adjudication,
  BookingDetails,
  Cas1OASysGroup,
  Cas1OASysGroupName,
  Cas1OASysMetadata,
  Cas1PersonalTimeline,
  Licence,
  Cas1SpaceBookingShortSummary,
  CsraSummary,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
} from '@approved-premises/api'

import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'
import { createQueryString } from '../utils/utils'

import oasysStubs from './stubs/oasysStubs.json'
import { normaliseCrn } from '../utils/normaliseCrn'

export default class PersonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(crn: string, checkCaseload: boolean): Promise<Person> {
    let query = { crn: normaliseCrn(crn) } as Record<string, string | boolean>

    if (checkCaseload) {
      query = { ...query, checkCaseload: true }
    }

    const path = `${paths.people.search({})}?${createQueryString(query)}`
    return this.restClient.get<Person>({
      path,
    })
  }

  async prisonCaseNotes(crn: string): Promise<Array<PrisonCaseNote>> {
    return this.restClient.get<Array<PrisonCaseNote>>({ path: paths.people.prisonCaseNotes({ crn }) })
  }

  async adjudications(crn: string): Promise<Array<Adjudication>> {
    return this.restClient.get<Array<Adjudication>>({ path: paths.people.adjudications({ crn }) })
  }

  async acctAlerts(crn: string): Promise<Array<PersonAcctAlert>> {
    return this.restClient.get<Array<PersonAcctAlert>>({ path: paths.people.acctAlerts({ crn }) })
  }

  async offences(crn: string): Promise<Array<ActiveOffence>> {
    return this.restClient.get<Array<ActiveOffence>>({ path: paths.people.offences({ crn }) })
  }

  async oasysMetadata(crn: string): Promise<Cas1OASysMetadata> {
    return this.restClient.get<Cas1OASysMetadata>({ path: paths.people.oasys.metadata({ crn }) })
  }

  async oasysAnswers(
    crn: string,
    groupName: Cas1OASysGroupName,
    optionalSections?: Array<number>,
  ): Promise<Cas1OASysGroup> {
    let response: Cas1OASysGroup

    if (config.flags.oasysDisabled) {
      response = {
        group: groupName,
        answers: oasysStubs[groupName],
        assessmentMetadata: oasysStubs.assessmentMetadata,
      }
    } else {
      const queryString: string = createQueryString({ group: groupName, includeOptionalSections: optionalSections })

      const path = `${paths.people.oasys.answers({ crn })}${queryString ? `?${queryString}` : ''}`

      response = await this.restClient.get<Cas1OASysGroup>({ path })
    }

    return response
  }

  async document(crn: string, documentId: string, response: Response): Promise<void> {
    await this.restClient.pipe(
      { path: paths.people.documents({ crn, documentId }), passThroughHeaders: ['content-disposition'] },
      response,
    )
  }

  async csraSummaries(crn: string): Promise<Array<CsraSummary>> {
    return this.restClient.get<Array<CsraSummary>>({ path: paths.people.csraSummaries({ crn }) })
  }

  async riskProfile(crn: string): Promise<PersonRisks> {
    return this.restClient.get<PersonRisks>({ path: paths.people.riskProfile({ crn }) })
  }

  async timeline(crn: string): Promise<Cas1PersonalTimeline> {
    return this.restClient.get<Cas1PersonalTimeline>({ path: paths.people.timeline({ crn }) })
  }

  async licenceDetails(crn: string): Promise<Licence> {
    return this.restClient.get<Licence>({ path: paths.people.licenceDetails({ crn }) })
  }

  async spaceBookings(crn: string, includeCancelled: boolean = true): Promise<Array<Cas1SpaceBookingShortSummary>> {
    const query = includeCancelled ? { includeCancelled: 'true' } : {}
    return this.restClient.get<Array<Cas1SpaceBookingShortSummary>>({
      path: paths.people.spaceBookings({ crn }),
      query,
    })
  }

  async bookingDetails(crn: string): Promise<BookingDetails> {
    return this.restClient.get<BookingDetails>({ path: paths.people.bookingDetails({ crn }) })
  }
}
