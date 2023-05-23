import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BedSummary } from '@approved-premises/api'

export default Factory.define<BedSummary>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  status: 'available',
}))
