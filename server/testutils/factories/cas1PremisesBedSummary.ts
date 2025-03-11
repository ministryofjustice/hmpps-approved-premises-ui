import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1PremisesBedSummary } from '@approved-premises/api'

export default Factory.define<Cas1PremisesBedSummary>(() => ({
  id: faker.string.uuid(),
  bedName: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
}))
