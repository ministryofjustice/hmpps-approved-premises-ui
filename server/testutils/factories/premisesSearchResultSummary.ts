import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesSearchResultSummary } from '@approved-premises/api'
import namedIdFactory from './namedId'
import { apCharacteristicPairFactory } from './bedSearchResult'

export default Factory.define<Cas1PremisesSearchResultSummary>(() => {
  return {
    id: faker.string.uuid(),
    apCode: faker.string.alphanumeric(5),
    deliusQCode: faker.string.alphanumeric(5),
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    name: faker.lorem.words(3),
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.county(),
    town: faker.location.city(),
    postcode: faker.location.zipCode(),
    apArea: namedIdFactory.build(),
    totalSpaceCount: faker.number.int({ min: 5, max: 50 }),
    premisesCharacteristics: apCharacteristicPairFactory.buildList(5),
  }
})
