import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { Cas1SpaceBookingRequirements } from '@approved-premises/api'
import { filterOutAPTypes } from '../../utils/match'
import { placementCriteria } from './placementRequest'

export default Factory.define<Cas1SpaceBookingRequirements>(() => {
  return {
    essentialCharacteristics: faker.helpers.arrayElements(filterOutAPTypes(placementCriteria)),
  }
})
