import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { User } from '@approved-premises/api'

export default Factory.define<User>(() => ({
  name: faker.name.fullName(),
  deliusUsername: faker.internet.userName(),
  email: faker.internet.email(),
  telephoneNumber: faker.phone.number(),
  roles: [],
  qualifications: [],
}))
