import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBookingRequirements } from '@approved-premises/api'

export default Factory.define<Cas1SpaceBookingRequirements>(() => {
  return {
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    needCharacteristics: faker.helpers.arrayElements(['single', 'enSuite', 'wheelchair', 'limitedMobility', 'catered']),
    riskCharacteristics: faker.helpers.arrayElements([
      'atRiskOfExploitation',
      'arson',
      'posesSexualRiskToAdults',
      'posesSexualRiskToChildren',
      'posesNonSexualRiskToChildren',
    ]),
    gender: faker.helpers.arrayElement(['male', 'female']),
  }
})
