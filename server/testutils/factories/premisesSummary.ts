import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApprovedPremisesSummary } from '@approved-premises/api'

export default Factory.define<ApprovedPremisesSummary>(() => ({
  id: faker.string.uuid(),
  service: 'approved-premises',
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  status: faker.helpers.arrayElement(['pending', 'active', 'archived']),
  postcode: faker.location.zipCode(),
  apCode: `${faker.string.alpha(2)}`,
  bedCount: 50,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.city(),
  probationRegion: faker.location.city(),
  apArea: faker.location.city(),
}))
