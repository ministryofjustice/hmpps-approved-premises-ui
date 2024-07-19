import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceAvailability } from '@approved-premises/api'

export default Factory.define<Cas1SpaceAvailability>(() => {
  return {
    needCharacteristics: faker.helpers.arrayElements(['single', 'enSuite', 'wheelchair', 'limitedMobility', 'catered']),
    riskCharacteristics: faker.helpers.arrayElements([
      'atRiskOfExploitation',
      'arson',
      'posesSexualRiskToAdults',
      'posesSexualRiskToChildren',
      'posesNonSexualRiskToChildren',
    ]),
    durationInDays: faker.number.int({ min: 1, max: 70 }),
  }
})
