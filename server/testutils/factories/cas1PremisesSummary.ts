import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesSummary } from '@approved-premises/api'
import { apAreaFactory } from './referenceData'

export default Factory.define<Cas1PremisesSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  postcode: faker.location.zipCode(),
  apCode: `${faker.string.alpha(2)}`,
  apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
  bedCount: 50,
  availableBeds: faker.number.int({ min: 0, max: 50 }),
  outOfServiceBeds: faker.number.int({ min: 0, max: 50 }),
  apArea: apAreaFactory.build(),
  supportsSpaceBookings: true,
  overbookingSummary: [],
}))
