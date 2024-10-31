import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Bed, Characteristic, CharacteristicPair } from '@approved-premises/api'

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
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  code: faker.lorem.words(1).toLocaleUpperCase(),
  notes: faker.lorem.sentence(),
  characteristics: roomCharacteristicFactory.buildList(faker.number.int({ min: 1, max: 1 })),
}))

const roomCharacteristicFactory = Factory.define<Characteristic>(() => ({
  id: faker.string.uuid(),
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
