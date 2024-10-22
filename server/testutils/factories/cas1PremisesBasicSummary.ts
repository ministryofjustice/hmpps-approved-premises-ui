import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesBasicSummary } from '@approved-premises/api'
import { apAreaFactory } from './referenceData'

export default Factory.define<Cas1PremisesBasicSummary>(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  apCode: `${faker.string.alpha(2)}`,
  bedCount: faker.number.int({ min: 10, max: 50 }),
  apArea: apAreaFactory.build(),
}))
