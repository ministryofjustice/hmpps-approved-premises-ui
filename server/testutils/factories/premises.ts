import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ApArea, ApprovedPremises, LocalAuthorityArea, ProbationRegion } from '@approved-premises/api'

export default Factory.define<ApprovedPremises>(() => ({
  id: faker.string.uuid(),
  service: 'approved-premises',
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  status: faker.helpers.arrayElement(['active', 'archived']),
  apCode: faker.string.alphanumeric(5),
  postcode: faker.location.zipCode(),
  bedCount: 50,
  availableBedsForToday: faker.number.int({ min: 0, max: 50 }),
  apAreaId: faker.string.alphanumeric(2),
  probationRegion: probationRegionFactory.build(),
  apArea: apAreaFactory.build(),
  localAuthorityArea: localAuthorityAreaFactory.build(),
  addressLine1: faker.location.streetAddress(),
}))

const probationRegionFactory = Factory.define<ProbationRegion>(() => ({
  id: faker.string.uuid(),
  name: faker.location.city(),
}))

const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.string.uuid(),
  name: faker.location.city(),
  identifier: faker.string.alphanumeric(),
}))

const localAuthorityAreaFactory = Factory.define<LocalAuthorityArea>(() => ({
  id: faker.string.uuid(),
  name: faker.location.county(),
  identifier: faker.string.alphanumeric(),
}))
