import type { Person } from 'approved-premises'
import { RestClientBuilder } from '../../data'
import type { PersonClient } from '../../data/approved-premises'

export default class PersonService {
  constructor(private readonly personClientFactory: RestClientBuilder<PersonClient>) {}

  async findByCrn(token: string, crn: string): Promise<Person> {
    const personClient = this.personClientFactory(token)

    const person = await personClient.search(crn)
    return person
  }
}
