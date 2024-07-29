import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBookingRequirements } from '@approved-premises/api'

export const spaceCharacteristics = [
  'hasBrailleSignage',
  'hasTactileFlooring',
  'hasHearingLoop',
  'isStepFreeDesignated',
  'isArsonDesignated',
  'isWheelchairDesignated',
  'isSingle',
  'isCatered',
  'isSuitedForSexOffenders',
  'isSuitableForVulnerable',
  'acceptsSexOffenders',
  'acceptsHateCrimeOffenders',
  'acceptsChildSexOffenders',
  'acceptsNonSexualChildOffenders',
  'isArsonSuitable',
  'isGroundFloor',
  'hasEnSuite',
] as const

export default Factory.define<Cas1SpaceBookingRequirements>(() => {
  return {
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    spaceCharacteristics: faker.helpers.arrayElements(spaceCharacteristics),
    gender: faker.helpers.arrayElement(['male', 'female']),
  }
})
