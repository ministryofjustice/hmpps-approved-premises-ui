import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApprovedPremisesUser as User } from '@approved-premises/api'

export default Factory.define<User>(() => ({
  name: faker.person.fullName(),
  deliusUsername: faker.internet.userName(),
  email: faker.internet.email(),
  telephoneNumber: faker.phone.number(),
  roles: [],
  qualifications: [],
  id: faker.string.uuid(),
  region: faker.helpers.arrayElement([{ id: faker.string.uuid(), name: faker.location.county() }]),
  service: 'ApprovedPremises',
}))
