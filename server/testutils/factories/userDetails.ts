import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { UserDetails } from '@approved-premises/ui'
import { apAreaFactory } from './referenceData'

export default Factory.define<UserDetails>(() => ({
  id: faker.string.uuid(),
  name: faker.internet.userName(),
  displayName: faker.person.fullName(),
  active: true,
  roles: [],
  permissions: [],
  apArea: apAreaFactory.build(),
}))
