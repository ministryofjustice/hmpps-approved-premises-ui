import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import { BedDetail, CharacteristicPair } from '@approved-premises/api'
import { placementCriteria } from './placementRequest'

export const apCharacteristicPairFactory = Factory.define<CharacteristicPair>(() => ({
  name: faker.lorem.sentence(),
  propertyName: faker.helpers.arrayElement(placementCriteria),
  premises: faker.company.name(),
}))

export default Factory.define<BedDetail>(() => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  roomName: faker.lorem.words(3),
  status: 'available',
  characteristics: apCharacteristicPairFactory.buildList(5),
}))
