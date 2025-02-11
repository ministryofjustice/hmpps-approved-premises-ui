import type { Response } from 'express'

import type {
  ActiveOffence,
  Adjudication,
  Cas1PersonalTimeline,
  OASysSection,
  OASysSections,
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
    const response = await this.restClient.get({
      path,
    })

    return response as Person
  }

  async risks(crn: string): Promise<PersonRisks> {
    const response = await this.restClient.get({
      path: paths.people.risks.show({ crn }),
    })

    return response as PersonRisks
  }

  async prisonCaseNotes(crn: string): Promise<Array<PrisonCaseNote>> {
    const response = await this.restClient.get({ path: paths.people.prisonCaseNotes({ crn }) })

    return response as Array<PrisonCaseNote>
  }

  async adjudications(crn: string): Promise<Array<Adjudication>> {
    const response = await this.restClient.get({ path: paths.people.adjudications({ crn }) })

    return response as Array<Adjudication>
  }

  async acctAlerts(crn: string): Promise<Array<PersonAcctAlert>> {
    const response = await this.restClient.get({ path: paths.people.acctAlerts({ crn }) })

    return response as Array<PersonAcctAlert>
  }

  async offences(crn: string): Promise<Array<ActiveOffence>> {
    const response = await this.restClient.get({ path: paths.people.offences({ crn }) })

    return response as Array<ActiveOffence>
  }

  async oasysSelections(crn: string): Promise<Array<OASysSection>> {
    const response = await this.restClient.get({ path: paths.people.oasys.selection({ crn }) })

    return response as Array<OASysSection>
  }

  async oasysSections(crn: string, selectedSections?: Array<number>): Promise<OASysSections> {
    let response: OASysSections

    if (config.flags.oasysDisabled) {
      response = oasysStubs as OASysSections
    } else {
      const queryString: string = createQueryString({ 'selected-sections': selectedSections })

      const path = `${paths.people.oasys.sections({ crn })}${queryString ? `?${queryString}` : ''}`

      response = (await this.restClient.get({ path })) as OASysSections
    }

    return response as OASysSections
  }

  async document(crn: string, documentId: string, response: Response): Promise<void> {
    await this.restClient.pipe(
      { path: paths.people.documents({ crn, documentId }), passThroughHeaders: ['content-disposition'] },
      response,
    )
  }

  async timeline(crn: string): Promise<Cas1PersonalTimeline> {
    return (await this.restClient.get({ path: paths.people.timeline({ crn }) })) as Promise<Cas1PersonalTimeline>
  }
}
