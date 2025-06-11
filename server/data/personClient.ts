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

  async oasysMetadata(crn: string): Promise<Array<Cas1OASysSupportingInformationQuestionMetaData>> {
    const response = (await this.restClient.get({ path: paths.people.oasys.metadata({ crn }) })) as {
      supportingInformation: Array<Cas1OASysSupportingInformationQuestionMetaData>
    }

    return response.supportingInformation as Array<Cas1OASysSupportingInformationQuestionMetaData>
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

      response = (await this.restClient.get({ path })) as Cas1OASysGroup
    }

    return response
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
