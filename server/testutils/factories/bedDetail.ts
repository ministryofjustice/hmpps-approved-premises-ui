import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { BedDetail } from '@approved-premises/api'
import { apCharacteristicPairFactory } from './bedSearchResult'

export default Factory.define<BedDetail>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  status: 'available',
  characteristics: apCharacteristicPairFactory.buildList(5),
}))
