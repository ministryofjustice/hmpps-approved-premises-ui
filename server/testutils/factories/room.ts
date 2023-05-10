import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Bed, Characteristic, CharacteristicPair, Room } from '@approved-premises/api'

export default Factory.define<Room>(() => ({
  id: faker.datatype.uuid(),
  name: faker.lorem.words(3),
  beds: bedFactory.buildList(faker.datatype.number({ min: 1, max: 2 })),
  code: faker.lorem.words(1).toLocaleUpperCase(),
  notes: faker.lorem.sentence(),
  characteristics: roomCharacteristicFactory.buildList(faker.datatype.number({ min: 1, max: 3 })),
}))

export const roomCharacteristicPairFactory = Factory.define<CharacteristicPair>(() => ({
  name: faker.helpers.arrayElement([
    'acceptsSexOffenders',
    'acceptsChildSexOffenders',
    'acceptsNonSexualChildOffenders',
    'acceptsHateCrimeOffenders',
    'isCatered',
    'hasWideStepFreeAccess',
    'hasWideAccessToCommunalAreas',
    'hasStepFreeAccessToCommunalAreas',
    'hasWheelChairAccessibleBathrooms',
    'hasLift',
    'hasTactileFlooring',
    'hasBrailleSignage',
    'hasHearingLoop',
    'additionalRestrictions',
  ]),
  premises: faker.company.name(),
}))

export const bedFactory = Factory.define<Bed>(() => ({
  id: faker.datatype.uuid(),
  name: faker.lorem.words(3),
  code: faker.lorem.words(1).toLocaleUpperCase(),
  notes: faker.lorem.sentence(),
  characteristics: roomCharacteristicFactory.buildList(faker.datatype.number({ min: 1, max: 1 })),
}))

const roomCharacteristicFactory = Factory.define<Characteristic>(() => ({
  id: faker.datatype.uuid(),
  name: faker.helpers.arrayElement([
    'acceptsSexOffenders',
    'acceptsChildSexOffenders',
    'acceptsNonSexualChildOffenders',
    'acceptsHateCrimeOffenders',
    'isCatered',
    'hasWideStepFreeAccess',
    'hasWideAccessToCommunalAreas',
    'hasStepFreeAccessToCommunalAreas',
    'hasWheelChairAccessibleBathrooms',
    'hasLift',
    'hasTactileFlooring',
    'hasBrailleSignage',
    'hasHearingLoop',
    'additionalRestrictions',
  ]),
  propertyName: faker.lorem.word(),
  serviceScope: 'approved-premises',
  modelScope: 'room',
}))
