import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBookingRequirements } from '@approved-premises/api'
import { filterOutAPTypes } from '../../utils/match/util'
import { placementCriteria } from './placementRequest'

export default Factory.define<Cas1SpaceBookingRequirements>(() => {
  return {
    apType: faker.helpers.arrayElement(['normal', 'pipe', 'esap', 'rfap', 'mhapStJosephs', 'mhapElliottHouse']),
    essentialCharacteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    desirableCharacteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
    gender: faker.helpers.arrayElement(['male', 'female']),
  }
})
