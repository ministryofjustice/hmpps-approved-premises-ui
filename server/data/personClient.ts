import type { ActiveOffence, Adjudication, Person, PersonRisks, PrisonCaseNote } from '@approved-premises/api'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'
import paths from '../paths/api'

export default class PersonClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('personClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async search(crn: string): Promise<Person> {
    const response = await this.restClient.get({
      path: `${paths.people.search({})}?crn=${crn}`,
    })

    return response as Person
  }

  async risks(crn: string): Promise<PersonRisks> {
    const response = await this.restClient.get({
      path: paths.people.risks.show({ crn }),
    })

    return response as PersonRisks
  }

  async prisonCaseNotes(crn: string): Promise<PrisonCaseNote[]> {
    const response = await this.restClient.get({ path: paths.people.prisonCaseNotes({ crn }) })

    return response as PrisonCaseNote[]
  }

  async adjudications(crn: string): Promise<Adjudication[]> {
    const response = await this.restClient.get({ path: paths.people.adjudications({ crn }) })

    return response as Adjudication[]
  }

  async offences(crn: string): Promise<ActiveOffence[]> {
    const response = await this.restClient.get({ path: paths.people.offences({ crn }) })

    return response as ActiveOffence[]
  }
}
