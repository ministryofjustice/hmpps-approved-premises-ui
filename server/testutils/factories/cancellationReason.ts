import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { CancellationReason } from '@approved-premises/api'

export default Factory.define<CancellationReason>(() => ({
  id: faker.string.uuid(),
  serviceScope: faker.lorem.sentence(),
  name: faker.lorem.sentence(),
  isActive: faker.datatype.boolean(),
}))
